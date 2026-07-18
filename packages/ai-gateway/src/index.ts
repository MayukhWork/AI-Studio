import type { SceneProposal } from '@ai3d/contracts';

/** Input accepted by an AI provider gateway. */
export interface ProposeSceneRequest {
  /** Natural-language instruction supplied by a presentation client. */
  readonly prompt: string;
}

/** Provider-neutral boundary for generating a structured scene proposal. */
export interface AiGateway {
  /** Returns a validated proposal or rejects unsupported instructions. */
  proposeScene(request: ProposeSceneRequest): Promise<SceneProposal>;
}

/** Raised when the deterministic Milestone 2 gateway cannot handle a prompt. */
export class UnsupportedPromptError extends Error {
  /** Creates an error that is safe to display to the caller. */
  public constructor(prompt: string) {
    super(`Milestone 2 supports only the prompt "Create a cube". Received: "${prompt}".`);
    this.name = 'UnsupportedPromptError';
  }
}

/**
 * Deterministic stand-in for a cloud provider.
 *
 * It exists only to prove the provider-neutral AI Gateway boundary. It returns
 * structured data and never exposes natural language to the execution layer.
 */
export class MockAiGateway implements AiGateway {
  /** @inheritdoc */
  public proposeScene(request: ProposeSceneRequest): Promise<SceneProposal> {
    if (request.prompt.trim().toLowerCase() !== 'create a cube') {
      return Promise.reject(new UnsupportedPromptError(request.prompt));
    }

    return Promise.resolve({ kind: 'create-cube' });
  }
}
