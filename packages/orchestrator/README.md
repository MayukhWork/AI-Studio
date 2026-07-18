# @ai3d/orchestrator

Execution policy, approvals, and agent coordination contracts.

## Milestone 2 responsibility

`DefaultExecutionOrchestrator` coordinates one complete typed path: prompt -> mock
proposal -> workflow step -> runtime request. It knows only the gateway, workflow,
and runtime ports; it does not import Blender or any concrete provider.

## Architectural placement

This is the coordinating core layer between application commands and engine-neutral
runtime execution.
