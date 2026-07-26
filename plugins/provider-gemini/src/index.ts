import type { AiGateway, ProposeSceneRequest } from '@ai3d/ai-gateway';
import { parseSceneProposal, type SceneProposal } from '@ai3d/contracts';
import { scenePlanV1Instructions, sceneProposalV1JsonSchema } from '@ai3d/prompts';

/** Configuration supplied by the GatewayFactory to the Gemini provider. */
export interface GeminiGatewayOptions {
  /** API key supplied from the selected provider configuration. */
  readonly apiKey: string;
  /** Requested Gemini model. Defaults to the Version 1 Gemini model. */
  readonly model?: string;
  /** Injectable transport for deterministic tests. */
  readonly fetchImplementation?: typeof fetch;
  /** Maximum duration of a single Gemini request in milliseconds. */
  readonly timeoutMilliseconds?: number;
}

/** Raised when Gemini configuration cannot safely create a request. */
export class GeminiConfigurationError extends Error {
  /** Creates a safe configuration error without retaining credentials. */
  public constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigurationError';
  }
}

/** Raised when Gemini cannot supply a usable structured scene plan. */
export class GeminiPlanningError extends Error {
  /** Creates a safe provider error without retaining credentials or response bodies. */
  public constructor(message: string) {
    super(message);
    this.name = 'GeminiPlanningError';
  }
}

/**
 * First-party Gemini implementation of the provider-neutral `AiGateway` port.
 * It sends only a prompt and receives declarative ScenePlan data, never Python.
 */
export class GeminiGateway implements AiGateway {
  private readonly fetchImplementation: typeof fetch;
  private readonly model: string;
  private readonly timeoutMilliseconds: number;

  /** Creates the gateway from an explicitly supplied API key and optional model. */
  public constructor(private readonly options: GeminiGatewayOptions) {
    validateOptions(options);
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.model = options.model?.trim() || defaultGeminiModel;
    this.timeoutMilliseconds = options.timeoutMilliseconds ?? defaultTimeoutMilliseconds;
  }

  /** @inheritdoc */
  public async proposeScene(request: ProposeSceneRequest): Promise<SceneProposal> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMilliseconds);

    try {
      const response = await this.fetchImplementation(createGenerateContentUrl(this.model), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.options.apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: scenePlanV1Instructions }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: request.prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: sceneProposalV1JsonSchema,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw createResponseError(response.status);
      }

      const responseBody = await parseResponseBody(response);
      const outputText = extractOutputText(responseBody);

      try {
        return parseSceneProposal(JSON.parse(outputText) as unknown);
      } catch (error: unknown) {
        if (error instanceof GeminiPlanningError) {
          throw error;
        }

        throw new GeminiPlanningError('Gemini returned a ScenePlan that failed validation.');
      }
    } catch (error: unknown) {
      if (error instanceof GeminiPlanningError) {
        throw error;
      }

      if (controller.signal.aborted) {
        throw new GeminiPlanningError('Gemini planning request timed out.');
      }

      throw new GeminiPlanningError('Gemini planning request failed due to a network error.');
    } finally {
      clearTimeout(timeout);
    }
  }
}

function validateOptions(options: GeminiGatewayOptions): void {
  if (options.apiKey.trim().length === 0) {
    throw new GeminiConfigurationError('GEMINI_API_KEY must be configured for Gemini.');
  }

  if (options.model !== undefined && options.model.trim().length === 0) {
    throw new GeminiConfigurationError('GEMINI_MODEL must not be empty when configured.');
  }

  if (
    options.timeoutMilliseconds !== undefined &&
    (!Number.isFinite(options.timeoutMilliseconds) || options.timeoutMilliseconds <= 0)
  ) {
    throw new GeminiConfigurationError('Gemini request timeout must be a positive finite number.');
  }
}

function createGenerateContentUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

function createResponseError(status: number): GeminiPlanningError {
  if (status === 401 || status === 403) {
    return new GeminiPlanningError('Gemini authentication failed. Verify GEMINI_API_KEY.');
  }

  if (status === 404) {
    return new GeminiPlanningError('The configured Gemini model is unavailable or unsupported.');
  }

  if (status === 429) {
    return new GeminiPlanningError('Gemini rate limited the planning request.');
  }

  if (status >= 500) {
    return new GeminiPlanningError('Gemini service is temporarily unavailable.');
  }

  return new GeminiPlanningError(`Gemini planning request failed with status ${status}.`);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  try {
    const responseBody: unknown = await response.json();
    return responseBody;
  } catch {
    throw new GeminiPlanningError('Gemini returned a malformed API response.');
  }
}

function extractOutputText(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.candidates)) {
    throw new GeminiPlanningError('Gemini returned no structured planning output.');
  }

  for (const candidate of value.candidates) {
    if (
      !isRecord(candidate) ||
      !isRecord(candidate.content) ||
      !Array.isArray(candidate.content.parts)
    ) {
      continue;
    }

    const output = candidate.content.parts
      .filter(isRecord)
      .map((part) => part.text)
      .filter((text): text is string => typeof text === 'string')
      .join('');

    if (output.length > 0) {
      return output;
    }
  }

  throw new GeminiPlanningError('Gemini returned no structured planning output.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const defaultGeminiModel = 'gemini-2.5-flash';
const defaultTimeoutMilliseconds = 30_000;
