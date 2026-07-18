import { ApplicationFacade } from '@ai3d/application';
import { MockAiGateway } from '@ai3d/ai-gateway';
import { DefaultExecutionOrchestrator } from '@ai3d/orchestrator';
import { LocalBlenderRuntime } from '@ai3d/plugin-engine-blender-local';
import { InMemoryWorkflowEngine } from '@ai3d/workflow-engine';

/** Parsed arguments for the Milestone 2 demonstration command. */
export interface CreateCubeCliOptions {
  /** The only accepted natural-language prompt. */
  readonly prompt: string;
  /** Path to the locally installed Blender executable. */
  readonly blenderExecutablePath: string;
}

/** Creates the complete Milestone 2 application composition. */
export function createMilestone2Application(blenderExecutablePath: string): ApplicationFacade {
  const runtime = new LocalBlenderRuntime({ blenderExecutablePath });
  const orchestrator = new DefaultExecutionOrchestrator({
    aiGateway: new MockAiGateway(),
    workflowEngine: new InMemoryWorkflowEngine(),
    runtime,
  });

  return new ApplicationFacade(orchestrator);
}

/** Parses arguments without coupling the application layer to process globals. */
export function parseCreateCubeCliOptions(argumentsList: readonly string[]): CreateCubeCliOptions {
  const [prompt, ...remainingArguments] = argumentsList;
  const blenderFlagIndex = remainingArguments.indexOf('--blender');
  const blenderExecutablePath =
    blenderFlagIndex >= 0 ? remainingArguments[blenderFlagIndex + 1] : undefined;

  if (prompt === undefined || blenderExecutablePath === undefined) {
    throw new Error('Usage: ai3d-create-cube "Create a cube" --blender <path-to-blender>');
  }

  return { prompt, blenderExecutablePath };
}

/** Executes the command-line demonstration and returns a process exit code. */
export async function runCli(argumentsList: readonly string[]): Promise<number> {
  try {
    const options = parseCreateCubeCliOptions(argumentsList);
    const application = createMilestone2Application(options.blenderExecutablePath);
    const result = await application.executePrompt({ prompt: options.prompt });

    console.log(`Completed ${result.toolResult.toolId}; Blender is opening with one cube.`);
    return 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown command failure.';
    console.error(message);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
