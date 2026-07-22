# 🌟 AI3D Architecture

<details open>
<summary><b>🚀 runCli()</b></summary>

```text
Responsibilities
---------------
• Parse CLI
• Validate API Key
• Configure Application
• Execute Prompt
```

---

<details>
<summary><b>📄 Parse CLI</b></summary>

```text
Function
--------
parseCreateCubeCliOptions(argv)

Input
-----
argv[]

Output
------
{
    prompt,
    blenderExecutablePath,
    model,
    outputDirectory
}
```

</details>

---

<details>
<summary><b>🔑 Validate API Key</b></summary>

```text
Checks

OPENAI_API_KEY

Throws
------
Error if missing
```

</details>

---

<details>
<summary><b>🏗️ createOpenAiApplication()</b></summary>

```text
Purpose
-------
Creates and wires all application components.

Returns
-------
ApplicationFacade
```

---

<details>
<summary><b>🟣 LocalBlenderRuntime</b></summary>

```text
Functions
---------
constructor()
createCube()
createScene()

Dependencies
------------
NodeBlenderProcessLauncher
```

<details>
<summary><b>⚙️ NodeBlenderProcessLauncher</b></summary>

```text
Functions
---------
launch()

Input
-----
BlenderLaunchRequest

Output
------
Starts Blender Process
```

</details>

</details>

---

<details>
<summary><b>🤖 OpenAiGateway</b></summary>

```text
Functions
---------
constructor()
proposeScene()

Input
-----
PromptRequest

Output
------
SceneProposal
```

</details>

---

<details>
<summary><b>🔄 InMemoryWorkflowEngine</b></summary>

```text
Functions
---------
run()
```

</details>

---

<details>
<summary><b>🎯 DefaultExecutionOrchestrator</b></summary>

```text
Functions
---------
constructor()
executePrompt()
planToScene()
```

</details>

---

<details>
<summary><b>🟢 ApplicationFacade</b></summary>

```text
Functions
---------
constructor()
executePrompt()
```

</details>

</details>

---

<details>
<summary><b>▶️ executePrompt()</b></summary>

```text
runCli()

    │
    ▼

ApplicationFacade.executePrompt()

    │
    ▼

DefaultExecutionOrchestrator.executePrompt()

    │
    ▼

OpenAiGateway.proposeScene()

    │
    ▼

SceneProposal

    │
    ▼

DefaultExecutionOrchestrator.planToScene()

    │
    ▼

InMemoryWorkflowEngine.run()

    │
    ▼

LocalBlenderRuntime.createScene()

    │
    ▼

NodeBlenderProcessLauncher.launch()

    │
    ▼

Blender
```

---

<details>
<summary><b>📄 ApplicationFacade.executePrompt()</b></summary>

```text
Purpose
-------
Delegates execution to the orchestrator.

Input
-----
PromptRequest

Calls
-----
DefaultExecutionOrchestrator.executePrompt()

Returns
-------
ExecutionResult
```

</details>

---

<details>
<summary><b>🎯 DefaultExecutionOrchestrator.executePrompt()</b></summary>

```text
Input
-----
PromptRequest
{
    prompt :
    "Create a villa"
}

Calls
-----
OpenAiGateway.proposeScene()

Receives
--------
SceneProposal

Calls
-----
planToScene(scene)

Returns
-------
ExecutionResult
```

</details>

---

<details>
<summary><b>🤖 OpenAiGateway.proposeScene()</b></summary>

```text
Input
-----
PromptRequest

Transforms

Natural Language
        │
        ▼
SceneProposal

Calls
-----
OpenAI Responses API
```

</details>

---

<details>
<summary><b>🧠 DefaultExecutionOrchestrator.planToScene()</b></summary>

```text
Input
-----
SceneProposal.scene

Creates
-------
CreateSceneToolRequest

Calls
-----
workflowEngine.run()
```

</details>

---

<details>
<summary><b>🔄 InMemoryWorkflowEngine.run()</b></summary>

```text
Input
-----
CreateSceneToolRequest

Calls
-----
runtime.createScene()
```

</details>

---

<details>
<summary><b>🏗️ LocalBlenderRuntime.createScene()</b></summary>

```text
Input
-----
CreateSceneToolRequest

Creates
-------
scene-plan.json

Calls
-----
NodeBlenderProcessLauncher.launch()
```

</details>

---

<details>
<summary><b>⚙️ NodeBlenderProcessLauncher.launch()</b></summary>

```text
Input
-----
BlenderLaunchRequest

Starts
------
Blender

Python reads
------------
scene-plan.json

Creates
-------
Objects
Lights
Camera
Materials

Returns
-------
CreateSceneToolResult
```

</details>

</details>

</details>