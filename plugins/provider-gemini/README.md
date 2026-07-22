# @ai3d/plugin-provider-gemini

First-party Gemini implementation of the provider-neutral `AiGateway` port.

## Phase 1 status

The plugin is registered and selectable through `@ai3d/gateway-factory`, but it
intentionally makes no Gemini API requests yet. Selecting `gemini` produces a
typed not-implemented error.
