import { spawn } from "node:child_process";
import process from "node:process";

const processes = [
  spawn(process.execPath, ["server/index.js"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: { ...process.env, PORT: process.env.API_PORT || "5174" }
  }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: { ...process.env, VITE_API_BASE: process.env.VITE_API_BASE || "http://127.0.0.1:5174" }
  })
];

const stop = () => {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
};

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stop();
  process.exit(0);
});

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      stop();
      process.exit(code);
    }
  });
}
