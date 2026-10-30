import { spawn } from "node:child_process";
const postgres =
  process.env.BYDT_DATABASE_PROVIDER === "postgresql" ||
  Boolean(process.env.VERCEL);
const executable = process.execPath;
const child = spawn(
  executable,
  [
    "node_modules/prisma/build/index.js",
    "generate",
    "--schema",
    postgres ? "prisma/postgres/schema.prisma" : "prisma/schema.prisma",
  ],
  { stdio: "inherit", env: process.env },
);
child.on("error", () => process.exit(1));
child.on("exit", (code) => process.exit(code ?? 1));
