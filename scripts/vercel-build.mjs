import { spawn } from "node:child_process";
if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL ?? ""))
  throw new Error(
    "Vercel deployment requires a persistent PostgreSQL DATABASE_URL. Local SQLite is not supported.",
  );
const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      env: { ...process.env, BYDT_DATABASE_PROVIDER: "postgresql" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error("Deployment build step failed")),
    );
  });
await run([
  "node_modules/prisma/build/index.js",
  "generate",
  "--schema",
  "prisma/postgres/schema.prisma",
]);
await run([
  "node_modules/prisma/build/index.js",
  "migrate",
  "deploy",
  "--schema",
  "prisma/postgres/schema.prisma",
]);
await run(["node_modules/next/dist/bin/next", "build"]);
