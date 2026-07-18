# @ai3d/plugin-engine-blender-local

First-party local Blender execution-engine plugin.

## Milestone 2 responsibility

`LocalBlenderRuntime` implements `SceneRuntime` by launching a visible locally
installed Blender process. The adapter uses a static Python expression bound to the
single allowlisted `scene.CreateCube@v1` tool; it never accepts prompt text,
arbitrary operators, or externally supplied scripts.

The bundled add-on and authenticated transport remain future work. They can replace
the process launcher behind this runtime port without changing the application,
orchestrator, workflow, or gateway layers.
