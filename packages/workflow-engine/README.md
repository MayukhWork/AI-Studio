# @ai3d/workflow-engine

Deterministic workflow state-machine and dependency execution contracts.

## Milestone 2 responsibility

The in-memory runner executes the already-selected `create-cube` operation and
reports its terminal status. Dependency execution, retries, cancellation, and
pause/resume are deliberately not exposed yet, rather than partially implemented.

## Architectural placement

The orchestrator delegates execution transitions to this package; the workflow
engine has no AI or Blender dependency.
