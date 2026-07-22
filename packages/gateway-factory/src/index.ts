import type { AiGateway } from '@ai3d/ai-gateway';
import { GeminiGateway } from '@ai3d/plugin-provider-gemini';
import { OpenAiGateway } from '@ai3d/plugin-provider-openai';

/** Supported identifiers for first-party LLM providers. */
export type LlmProvider = 'openai' | 'gemini';

/** Provider-neutral configuration resolved from the process environment. */
export interface LLMConfig {
  /** Registered provider identifier. */
  readonly provider: LlmProvider;
  /** Credential for the selected provider only. */
  readonly apiKey: string;
  /** Optional selected-provider model override. */
  readonly model?: string;
}

/** Creates an `AiGateway` from one selected provider configuration. */
export interface AiGatewayProvider {
  /** Constructs the provider-neutral gateway implementation. */
  create(config: LLMConfig): AiGateway;
}

/** Raised when provider configuration cannot be resolved safely. */
export class InvalidLlmConfigurationError extends Error {
  /** Creates a safe configuration error. */
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidLlmConfigurationError';
  }
}

/**
 * Reusable composition boundary for selecting an `AiGateway` implementation.
 * The application, orchestrator, workflow, and runtime remain provider-agnostic.
 */
export class AiGatewayFactory {
  /** Creates the selected gateway using the default first-party registry. */
  public static fromEnvironment(environment: NodeJS.ProcessEnv = process.env): AiGateway {
    return new AiGatewayFactory(providerRegistry).create(readLlmConfig(environment));
  }

  /** Creates a factory from a registry, enabling deterministic provider tests. */
  public constructor(
    private readonly providers: Readonly<Record<LlmProvider, AiGatewayProvider>>,
  ) {}

  /** Resolves the selected provider without exposing concrete providers to callers. */
  public create(config: LLMConfig): AiGateway {
    return this.providers[config.provider].create(config);
  }
}

/** First-party provider registry; adding a provider is an additive registration. */
export const providerRegistry: Readonly<Record<LlmProvider, AiGatewayProvider>> = {
  openai: {
    create: (config) => new OpenAiGateway({ apiKey: config.apiKey, ...withModel(config) }),
  },
  gemini: {
    create: (config) => new GeminiGateway({ apiKey: config.apiKey, ...withModel(config) }),
  },
};

function readLlmConfig(environment: NodeJS.ProcessEnv): LLMConfig {
  const provider = parseProvider(environment.LLM_PROVIDER);
  const binding = environmentBindings[provider];
  const apiKey = environment[binding.apiKeyName];

  if (apiKey === undefined || apiKey.length === 0) {
    throw new InvalidLlmConfigurationError(
      `${binding.apiKeyName} must be configured for ${provider}.`,
    );
  }

  const model = environment[binding.modelName];
  return { provider, apiKey, ...(model === undefined || model.length === 0 ? {} : { model }) };
}

function parseProvider(value: string | undefined): LlmProvider {
  const provider = value ?? 'openai';
  if (provider === 'openai' || provider === 'gemini') {
    return provider;
  }

  throw new InvalidLlmConfigurationError('LLM_PROVIDER must be either "openai" or "gemini".');
}

function withModel(config: LLMConfig): { readonly model?: string } {
  return config.model === undefined ? {} : { model: config.model };
}

const environmentBindings: Readonly<
  Record<LlmProvider, { readonly apiKeyName: string; readonly modelName: string }>
> = {
  openai: { apiKeyName: 'OPENAI_API_KEY', modelName: 'OPENAI_MODEL' },
  gemini: { apiKeyName: 'GEMINI_API_KEY', modelName: 'GEMINI_MODEL' },
};
