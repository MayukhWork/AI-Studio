import type { ExecutePromptResult } from '@ai3d/orchestrator';
import type { ApplicationFacade } from '@ai3d/application';

/** View-model returned to an eventual desktop UI after prompt submission. */
export interface PromptExecutionViewModel {
  /** A concise status that a UI can render without Blender knowledge. */
  readonly message: string;
  /** The execution result returned by the application layer. */
  readonly execution: ExecutePromptResult;
}

/**
 * Presentation adapter for the future desktop shell.
 *
 * It owns no Blender, AI, workflow, or orchestration behavior. A UI framework
 * can call this class when a desktop framework is selected in a later milestone.
 */
export class DesktopClient {
  /** Creates the presentation client from the application API. */
  public constructor(private readonly application: ApplicationFacade) {}

  /** Sends user-entered text through the application layer. */
  public async submitPrompt(prompt: string): Promise<PromptExecutionViewModel> {
    const execution = await this.application.executePrompt({ prompt });

    return {
      message: 'Blender was launched to create one cube.',
      execution,
    };
  }
}
