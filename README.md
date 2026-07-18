# AI3D Studio

AI3D Studio is a local-first AI-assisted 3D scene authoring platform.

## Milestone 2 vertical slice

Milestone 2 proves the intended execution boundaries with one deliberately small,
complete path:

```text
Desktop presentation adapter / CLI
  -> ApplicationFacade
  -> DefaultExecutionOrchestrator
  -> InMemoryWorkflowEngine
  -> MockAiGateway
  -> SceneRuntime
  -> Local Blender process
```

The only accepted prompt is `Create a cube`. The mock gateway returns a typed
`create-cube` proposal, the orchestrator creates an allowlisted
`scene.CreateCube@v1` request, and the local engine launches visible Blender with
exactly one cube. No prompt text is passed to Blender and no generic scripting or
Blender operator interface is exposed.

The desktop framework remains intentionally unselected. `@ai3d/desktop` is the
framework-independent presentation adapter; the CLI is the runnable Milestone 2
composition root.

### Run the vertical slice

Build the workspace, then supply the installed Blender executable:

```powershell
pnpm build
pnpm --filter @ai3d/cli start -- "Create a cube" --blender "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe"
```

Blender opens visibly, removes its default startup objects, and displays one cube.
The command exits once Windows has accepted the Blender process.

## Quality commands

- `pnpm build` — compile workspace packages.
- `pnpm lint` — run static analysis.
- `pnpm typecheck` — run TypeScript checks.
- `pnpm test` — run unit-test infrastructure.
- `pnpm verify` — run the required CI quality gate.

Architecture and implementation planning live in `docs/architecture/`.
