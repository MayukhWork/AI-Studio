import type { ExecutePromptResult } from '@ai3d/orchestrator';

/** Command issued by a presentation client to start scene execution. */
export interface ExecutePromptCommand {
  /** The user's natural-language scene instruction. */
  readonly prompt: string;
  /** Optional caller-provided ID used to correlate the execution. */
  readonly correlationId?: string;
}

/** Orchestrator port consumed by the application service. */
export interface PromptExecutionService {
  /** Executes an already accepted prompt. */
  executePrompt(request: {
    readonly prompt: string;
    readonly correlationId: string;
  }): Promise<ExecutePromptResult>;
}

/**
 * Framework-independent API shared by desktop and CLI clients.
 */
export class ApplicationFacade {
  /** Creates the public application API from the orchestration port. */
  public constructor(private readonly promptExecutionService: PromptExecutionService) {}

  /** Executes a user prompt through the complete Milestone 2 path. */
  public async executePrompt(command: ExecutePromptCommand): Promise<ExecutePromptResult> {
    return this.promptExecutionService.executePrompt({
      prompt: command.prompt,
      correlationId: command.correlationId ?? crypto.randomUUID(),
    });
  }
}
