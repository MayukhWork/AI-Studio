# @ai3d/runtime-protocol

Versioned controller/runtime communication contracts.

## Milestone 2 responsibility

`SceneRuntime` is the engine-neutral port used by the orchestrator to request one
typed cube operation. A future Blender add-on transport and remote workers can
implement this same boundary.

## Architectural placement

The protocol exposes no raw Python or arbitrary Blender operator command.
