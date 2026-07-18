# @ai3d/contracts

Versioned cross-package contract vocabulary.

## Milestone 2 responsibility

This package defines the sole allowlisted tool vocabulary:
`scene.CreateCube@v1`, its typed request/result, and the `create-cube` proposal.
It remains free of business logic and infrastructure dependencies.

## Architectural placement

This package belongs to the framework-independent workspace core and is imported
by the gateway, orchestrator, runtime protocol, and Blender engine plugin.
