import { parseSceneProposal, type SceneProposal } from '@ai3d/contracts';
import type { AiGateway, ProposeSceneRequest } from '@ai3d/ai-gateway';
import { scenePlanV1Instructions, sceneProposalV1JsonSchema } from '@ai3d/prompts';

/** Configuration for the first-party OpenAI provider adapter. */
export interface OpenAiGatewayOptions {
  /** API key obtained from a caller-controlled secret source. */
  readonly apiKey: string;
  /** Optional model override. Defaults to a current general-purpose model. */
  readonly model?: string;
  /** Injectable transport for deterministic tests. */
  readonly fetchImplementation?: typeof fetch;
}

/** Raised when OpenAI cannot supply a usable structured scene plan. */
export class OpenAiPlanningError extends Error {
  /** Creates a safe provider error without exposing credentials. */
  public constructor(message: string) {
    super(message);
    this.name = 'OpenAiPlanningError';
  }
}

/**
 * First-party OpenAI implementation of the provider-neutral `AiGateway` port.
 * It sends only the prompt and receives declarative ScenePlan data, never Python.
 */
export class OpenAiGateway implements AiGateway {
  private readonly fetchImplementation: typeof fetch;
  private readonly model: string;

  /** Creates the gateway from an explicitly supplied API key and optional model. */
  public constructor(private readonly options: OpenAiGatewayOptions) {
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.model = options.model ?? 'gpt-5.6-terra';
  }

  /** @inheritdoc */
  public async proposeScene(request: ProposeSceneRequest): Promise<SceneProposal> {
    const response = await this.fetchImplementation('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        instructions: scenePlanV1Instructions,
        input: request.prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'scene_plan_v1',
            strict: true,
            schema: sceneProposalV1JsonSchema,
          },
        },
      }),
    });

    // if (!response.ok) {
    //   throw new OpenAiPlanningError(`OpenAI planning request failed with status ${response.status}.`);
    // }
    if (!response.ok) {
      const body = await response.text();

      throw new Error(`OpenAI Error\nStatus: ${response.status}\nBody: ${body}`);
    }

    const responseBody: unknown = await response.json();
    const outputText = extractOutputText(responseBody);

    try {
      return parseSceneProposal(JSON.parse(outputText) as unknown);
    } catch (error: unknown) {
      if (error instanceof OpenAiPlanningError) {
        throw error;
      }

      throw new OpenAiPlanningError('OpenAI returned a ScenePlan that failed validation.');
    }
  }
}

function extractOutputText(value: unknown): string {
  if (isRecord(value) && typeof value.output_text === 'string') {
    return value.output_text;
  }

  if (isRecord(value) && Array.isArray(value.output)) {
    for (const item of value.output) {
      if (isRecord(item) && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (
            isRecord(content) &&
            content.type === 'output_text' &&
            typeof content.text === 'string'
          ) {
            return content.text;
          }
        }
      }
    }
  }

  throw new OpenAiPlanningError('OpenAI returned no structured planning output.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
