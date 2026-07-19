const { spawn } = require("node:child_process");

const blenderPath =
  "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe";

console.log("Starting Blender...");

console.log(blenderPath);
console.log(require("fs").existsSync(blenderPath));


const blender = spawn(blenderPath);
console.log(blender);
blender.on("spawn", () => {
  console.log("✅ Blender started!");
});

blender.on("error", (err) => {
  console.log("❌ Failed to start Blender");
  console.log(err);
});

blender.on("exit", (code) => {
  console.log("Blender exited with code:", code);
});