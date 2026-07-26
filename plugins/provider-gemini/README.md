# @ai3d/plugin-provider-gemini

First-party Gemini implementation of the provider-neutral `AiGateway` port.

## Phase 2 status

The plugin is registered and selected through `@ai3d/gateway-factory` when
`LLM_PROVIDER=gemini`. It calls Gemini's `generateContent` API with the shared
ScenePlan v1 structured-output prompt and schema, then validates the response
against the provider-neutral `SceneProposal` contract before returning it.

Configuration is supplied only by the factory: `GEMINI_API_KEY` is required and
`GEMINI_MODEL` is optional (default: `gemini-2.5-flash`).
