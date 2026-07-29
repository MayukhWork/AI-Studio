import { config } from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ApplicationFacade } from '@ai3d/application';
import { AiGatewayFactory } from '@ai3d/gateway-factory';
import { MockAiGateway } from '@ai3d/ai-gateway';
import { DefaultExecutionOrchestrator } from '@ai3d/orchestrator';
import { LocalBlenderRuntime } from '@ai3d/plugin-engine-blender-local';
import { InMemoryWorkflowEngine } from '@ai3d/workflow-engine';

loadCliEnvironment();

/**
 * Loads the repository-root environment file for the CLI process.
 *
 * Existing operating-system environment variables take precedence over `.env`,
 * which keeps CI and shell-based configuration working unchanged.
 */
function loadCliEnvironment(): void {
  const environmentPath = fileURLToPath(new URL('../../../.env', import.meta.url));
  config({ path: environmentPath });
}

/** Parsed arguments for a local scene-generation command. */
export interface CreateCubeCliOptions {
  /** The only accepted natural-language prompt. */
  readonly prompt: string;
  /** Path to the locally installed Blender executable. */
  readonly blenderExecutablePath: string;
}

/** Creates the backward-compatible deterministic cube demonstration. */
export function createMilestone2Application(blenderExecutablePath: string): ApplicationFacade {
  const runtime = new LocalBlenderRuntime({ blenderExecutablePath });
  const orchestrator = new DefaultExecutionOrchestrator({
    aiGateway: new MockAiGateway(),
    workflowEngine: new InMemoryWorkflowEngine(),
    runtime,
  });

  return new ApplicationFacade(orchestrator);
}

/** Creates the application composition using the environment-selected provider. */
export function createConfiguredApplication(blenderExecutablePath: string): ApplicationFacade {
  const runtime = new LocalBlenderRuntime({ blenderExecutablePath });
  const orchestrator = new DefaultExecutionOrchestrator({
    aiGateway: AiGatewayFactory.fromEnvironment(),
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
    const application = createConfiguredApplication(options.blenderExecutablePath);
    const result = await application.executePrompt({ prompt: options.prompt });

    console.log(
      `Completed ${result.toolResult.toolId}; Blender is opening with the generated scene.`,
    );
    return 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown command failure.';
    console.error(message);
    return 1;
  }
}

/** Determines whether this module was invoked as the CLI entrypoint. */
export function isCliEntrypoint(
  moduleUrl: string,
  entrypointPath: string | undefined = process.argv[1],
): boolean {
  return entrypointPath !== undefined && moduleUrl === pathToFileURL(entrypointPath).href;
}

if (isCliEntrypoint(import.meta.url)) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
