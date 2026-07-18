/** Describes a single executable unit in the deterministic workflow. */
export interface WorkflowStep<TResult> {
  /** A stable name used for diagnostics and tests. */
  readonly name: string;
  /** Performs the unit of work once the workflow transitions to running. */
  readonly run: () => Promise<TResult>;
}

/** Minimal state exposed for the one-step Milestone 2 workflow. */
export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed';

/** Result of running one workflow step. */
export interface WorkflowRunResult<TResult> {
  /** Final workflow state. */
  readonly status: 'completed';
  /** The result returned by the executed step. */
  readonly value: TResult;
}

/**
 * Deterministic, in-process execution boundary.
 *
 * This first slice deliberately executes one validated step. Dependency graphs,
 * retries, and pause/resume remain unimplemented rather than partially exposed.
 */
export class InMemoryWorkflowEngine {
  private status: WorkflowStatus = 'idle';

  /** Runs one step and exposes its terminal state. */
  public async run<TResult>(step: WorkflowStep<TResult>): Promise<WorkflowRunResult<TResult>> {
    if (this.status === 'running') {
      throw new Error('A workflow step is already running.');
    }

    this.status = 'running';

    try {
      const value = await step.run();
      this.status = 'completed';
      return { status: 'completed', value };
    } catch (error: unknown) {
      this.status = 'failed';
      throw error;
    }
  }

  /** Returns the current state for the active process. */
  public getStatus(): WorkflowStatus {
    return this.status;
  }
}
