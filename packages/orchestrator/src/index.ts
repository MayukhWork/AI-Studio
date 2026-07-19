import {
  createCubeToolId,
  createSceneToolId,
  type SceneProposal,
  type SceneToolResult,
} from '@ai3d/contracts';
import type { AiGateway } from '@ai3d/ai-gateway';
import type { SceneRuntime } from '@ai3d/runtime-protocol';
import type { InMemoryWorkflowEngine } from '@ai3d/workflow-engine';

/** Input to the execution coordinator. */
export interface ExecutePromptRequest {
  /** User's natural-language instruction. */
  readonly prompt: string;
  /** Correlates the command through every participating layer. */
  readonly correlationId: string;
}

/** Successful result of the Milestone 2 execution path. */
export interface ExecutePromptResult {
  /** Structured AI proposal used to select the operation. */
  readonly proposal: SceneProposal;
  /** Result returned by the runtime after the typed tool request. */
  readonly toolResult: SceneToolResult;
}

/** Dependencies supplied by the composition root. */
export interface ExecutionOrchestratorDependencies {
  /** Provider-neutral proposal generator. */
  readonly aiGateway: AiGateway;
  /** Deterministic executor for the selected workflow step. */
  readonly workflowEngine: InMemoryWorkflowEngine;
  /** Engine-neutral runtime port for typed scene operations. */
  readonly runtime: SceneRuntime;
}

/**
 * Coordinates the Milestone 2 execution path without knowing Blender APIs or
 * concrete AI provider implementations.
 */
export class DefaultExecutionOrchestrator {
  /** Creates an orchestrator from explicit infrastructure ports. */
  public constructor(private readonly dependencies: ExecutionOrchestratorDependencies) {}

  /** Converts a user prompt into a typed runtime operation and executes it. */
  public async executePrompt(request: ExecutePromptRequest): Promise<ExecutePromptResult> {
    const proposal = await this.dependencies.aiGateway.proposeScene({ prompt: request.prompt });

    return this.executeProposal(proposal, request.correlationId);
  }

  private async executeProposal(
    proposal: SceneProposal,
    correlationId: string,
  ): Promise<ExecutePromptResult> {
    const workflowResult = await this.dependencies.workflowEngine.run<SceneToolResult>(
      proposal.kind === 'create-cube'
        ? {
            name: proposal.kind,
            run: () =>
              this.dependencies.runtime.createCube({
                toolId: createCubeToolId,
                correlationId,
              }),
          }
        : {
            name: proposal.kind,
            run: () =>
              this.dependencies.runtime.createScene({
                toolId: createSceneToolId,
                correlationId,
                scene: proposal.scene,
              }),
          },
    );

    return {
      proposal,
      toolResult: workflowResult.value,
    };
  }
}
