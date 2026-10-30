import { closeSync, openSync } from "node:fs";
closeSync(openSync(new URL("../prisma/test.db", import.meta.url), "a"));
