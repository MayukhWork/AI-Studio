# @ai3d/application

Client-facing application commands and queries.

## Milestone 2 responsibility

`ApplicationFacade.executePrompt` is the shared desktop/CLI API. It delegates to an
injected orchestration port and returns a typed execution result. It has no Blender
or provider dependency.

## Architectural placement

Presentation clients call this facade; they must not invoke a runtime directly.
