import { describe, expect, it } from 'vitest';
import { GeminiGateway } from '@ai3d/plugin-provider-gemini';
import { OpenAiGateway } from '@ai3d/plugin-provider-openai';

import {
  AiGatewayFactory,
  type AiGatewayProvider,
  type LLMConfig,
  InvalidLlmConfigurationError,
} from '../src/index.js';

describe('AiGatewayFactory', () => {
  it('selects the OpenAI registration', () => {
    const factory = new AiGatewayFactory(testRegistry);

    expect(factory.create({ provider: 'openai', apiKey: 'openai-key' })).toBe(openAiGateway);
  });

  it('selects the Gemini registration', () => {
    const factory = new AiGatewayFactory(testRegistry);

    expect(factory.create({ provider: 'gemini', apiKey: 'gemini-key' })).toBe(geminiGateway);
  });

  it('rejects unsupported provider values from the environment', () => {
    expect(() => AiGatewayFactory.fromEnvironment({ LLM_PROVIDER: 'unsupported' })).toThrow(
      InvalidLlmConfigurationError,
    );
  });

  it('requires only the selected provider credential', () => {
    expect(() => AiGatewayFactory.fromEnvironment({ LLM_PROVIDER: 'gemini' })).toThrow(
      'GEMINI_API_KEY must be configured for gemini.',
    );
  });

  it('defaults to OpenAI when LLM_PROVIDER is omitted', () => {
    expect(AiGatewayFactory.fromEnvironment({ OPENAI_API_KEY: 'openai-key' })).toBeInstanceOf(
      OpenAiGateway,
    );
  });

  it('creates Gemini when the Gemini provider is selected', () => {
    expect(
      AiGatewayFactory.fromEnvironment({
        LLM_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'gemini-key',
        GEMINI_MODEL: 'gemini-test-model',
      }),
    ).toBeInstanceOf(GeminiGateway);
  });
});

const openAiGateway = { proposeScene: async () => ({ kind: 'create-cube' as const }) };
const geminiGateway = { proposeScene: async () => ({ kind: 'create-cube' as const }) };

const testRegistry: Readonly<Record<'openai' | 'gemini', AiGatewayProvider>> = {
  openai: { create: (_config: LLMConfig) => openAiGateway },
  gemini: { create: (_config: LLMConfig) => geminiGateway },
};
