// 1. Workflow Engine
class WorkflowEngine {
    constructor() {
        this.status = "idle";
    }

    async run(step) {
        console.log("Current Status:", this.status);

        if (this.status === "running") {
            throw new Error("Workflow already running");
        }

        this.status = "running";
        console.log("Status:", this.status);

        const value = await step.run();

        this.status = "completed";
        console.log("Status:", this.status);

        return {
            status: this.status,
            value
        };
    }
}

// 2. Create a Workflow Step
const createCubeStep = {
    name: "create-cube",

    async run() {
        console.log("Inside step.run()");
        return "Cube Created";
    }
};

// 3. Main Function
async function main() {
    const workflow = new WorkflowEngine();

    const result = await workflow.run(createCubeStep);

    console.log(result);
}

main();