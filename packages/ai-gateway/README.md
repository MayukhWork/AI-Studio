# @ai3d/ai-gateway

Provider-neutral structured AI invocation contracts.

## Milestone 2 responsibility

`MockAiGateway` is a deterministic provider substitute. It accepts only `Create a
cube` and returns a typed proposal. It proves the gateway boundary without
introducing a real model provider, prompt catalog, or planner.

## Architectural placement

The orchestrator depends on the `AiGateway` port, never on a specific provider.
