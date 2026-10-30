# Curio City — by BYDT

A working local capability workshop, public occupational explorer, and persistent skill passport. The child flow is deliberately brief: pick a visual spark, read one short response, follow one offline step at a time, then return with a one-sentence reflection.

## Run

Requires Node 20.19+ and npm.

```sh
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open http://localhost:3000. `/explore` is public. The root app contains Workshop, For grown-ups, and Skill passport views. Explorer and Builder select two independent synthetic profiles. Data survives server restarts in `prisma/dev.db`; export and profile deletion are available in the passport view.

For a production build locally:

```sh
npm run build
npm start
```

## Evidence, not career labels

Chat appends a **discovered** event and assigns a curated mission. Logging a build appends **self_reported** evidence with a scrubbed reflection. A demo adult review appends **adult_reviewed** separately. Completion and review are idempotent. Assignments, source versions, dictionary versions, and O*NET element/DWA IDs travel with the evidence. Client-supplied passport data is never authoritative.

No transcript or audio is saved. No analytics, advertising, or model-training pipeline is included. The microphone is disabled. `/api/voice-transcribe` returns 501 and demonstrates bounded buffer cleanup, not real edge transcription.

## Optional live services

Demo mode works without any credentials. To enable live services locally, set `BYDT_LIVE_APIS=true` plus `OPENAI_API_KEY` and/or `ONET_API_KEY` in `.env.local`. Legacy O*NET supports `ONET_USERNAME` / `ONET_PASSWORD`. Register the application with O*NET before live use. `OPENAI_MODEL` defaults to `gpt-4.1-mini`.

O*NET requests have timeouts, a bounded retry for 429, version-aware 24-hour in-memory caching, legacy auth fallback, and labeled snapshot fallback for supported occupations. OpenAI uses Structured Outputs, strict canonical ID validation, short age-band word limits, and deterministic fallback. Provider credentials remain server-only. Live authenticated services were not exercised in this environment.

See [source notes](docs/SOURCES.md) for verified O*NET 31.0 mappings and integration limits. The live workshop mission catalog covers four occupations; unknown mission/DWA links fail rather than inventing evidence.

## Verify

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests use the local Chromium installation (`CHROMIUM_PATH`, default `/usr/bin/chromium`), or Playwright's browser when that path is absent. Install a Playwright browser if needed with `npx playwright install chromium`. Tests use synthetic profiles and clean their test records. Do not run browser tests against a shared demo containing records you want to keep. Unit tests use a separate test SQLite database.

## Boundaries

This is a **local demonstration with synthetic profiles**, not a real-child pilot. There is no adult authentication, verified parental consent, or tenant access isolation. Automated PII filtering is heuristic and cannot guarantee detection of arbitrary names or indirect identifiers. Never enter real children's data or expose this demo publicly.

A real deployment needs consent, authenticated roles, authorization, institution-specific retention and deletion, provider data handling review, and operational security. ACP/Perkins views are illustrative planning exports using an explicitly versioned legacy cluster mapping. They are not certified reporting, aptitude assessment, or inferred counseling needs.


## Vercel deployment

The product is **Curio City**, developed by **Build Your Dreaming Things (BYDT)**. The public deployment remains a synthetic-data demonstration.

Vercel builds use `prisma/postgres/schema.prisma`, apply its tracked PostgreSQL migrations, and generate the PostgreSQL Prisma client. Local development and tests continue to use SQLite. Configure `DATABASE_URL` in Vercel with a persistent PostgreSQL database; local SQLite files are deliberately excluded from deployment. Set `BYDT_LIVE_APIS=false` for the credential-free demonstration. Never commit provider credentials or database connection strings.

The GitHub CI workflow verifies lint, unit tests, the build, and browser flows. Import the repository into Vercel as a Next.js project; `vercel.json` supplies the install/build commands. Keep preview and production databases separate if both environments are enabled. `npm run db:migrate:postgres` applies the same versioned schema independently when needed.
