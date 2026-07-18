# @ai3d/cli

Command-line presentation client.

## Milestone 2 responsibility

The CLI is the runnable composition root for the vertical slice. It wires the
application facade to injected core services and the local Blender engine, then
calls the application API.

```powershell
pnpm --filter @ai3d/cli start -- "Create a cube" --blender "C:\Path\To\blender.exe"
```

The CLI accepts only `Create a cube` and returns a non-zero exit code for any other
prompt or an invalid Blender path.
