import type { AiGateway, ProposeSceneRequest } from '@ai3d/ai-gateway';
import type { SceneProposal } from '@ai3d/contracts';

/** Configuration supplied by the GatewayFactory to the Gemini provider. */
export interface GeminiGatewayOptions {
  /** API key supplied from the selected provider configuration. */
  readonly apiKey: string;
  /** Requested Gemini model. */
  readonly model?: string;
}

/** Raised until Gemini API transport is implemented in a later phase. */
export class GeminiGatewayNotImplementedError extends Error {
  /** Creates a safe provider error without exposing configuration values. */
  public constructor() {
    super('Gemini provider support is not implemented yet.');
    this.name = 'GeminiGatewayNotImplementedError';
  }
}

/**
 * Gemini implementation placeholder for the existing provider-neutral port.
 *
 * Phase 1 deliberately provides selection infrastructure only; this class does
 * not make network requests or change scene-planning behavior.
 */
export class GeminiGateway implements AiGateway {
  /** Creates the provider from factory-owned configuration. */
  public constructor(private readonly options: GeminiGatewayOptions) {}

  /** @inheritdoc */
  public proposeScene(request: ProposeSceneRequest): Promise<SceneProposal> {
    void this.options;
    void request;
    return Promise.reject(new GeminiGatewayNotImplementedError());
  }
}
