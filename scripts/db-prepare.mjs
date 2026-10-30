import { closeSync, openSync, mkdirSync } from "node:fs";
mkdirSync(new URL("../prisma/", import.meta.url), { recursive: true });
closeSync(openSync(new URL("../prisma/dev.db", import.meta.url), "a"));
