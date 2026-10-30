# Curio City — a product by Build Your Dreaming Things (BYDT)

## Mission
Build a K–8 capability discovery workshop, offline project launchpad, and longitudinal passport. Curiosity leads to O*NET-backed Cape-Abilities and hands-on missions, never occupational destiny quizzes.

## Architecture
Next.js 15 App Router, strict TypeScript, Tailwind CSS, OpenAI Structured Outputs with Zod. Server-only O*NET adapters support v2 X-API-Key and v1.9 Basic Auth. Prisma/SQLite stores versioned canonical mappings, assignments, and append-only evidence. Public /explore never requires registration.

## Privacy and source integrity
This release is a local synthetic-data demonstration, not an approved real-child service. Do not claim COPPA or Perkins V certification. Scrub every submitted free-text field before external calls or persistence. Never log raw conversations, persist audio, use advertising, or train on conversations. Voice is disabled; buffer-cleanup stub only. Automated PII scrubbing is imperfect. Real deployment requires consent, authenticated adult roles, authorization, retention and deletion policies, and provider review.
Raw O*NET content must carry official USDOL/ETA attribution and source/version information. Clearly label fixtures and failures. Never fabricate IDs, raw summaries, or source claims. Public access alone does not prove licensing compliance.

## Pedagogy
Counter gender/status circumscription and STEM anxiety with grounded growth language. Every chat has reflective, narrative, persuasive, and instructional pillars. Support Bandura's mastery, vicarious modeling, social persuasion, and affective coping. Adapt English/Spanish text to Explorer ages 6–8 or Builder ages 9–13. Launch safe 15–45-minute offline missions using household materials, with return reflection.

## Evidence
Discovery is not mastery. Record discovery, self-reported completion, and adult review as separate events linked to canonical O*NET IDs and assigned missions. No automated counseling tier or aptitude diagnosis. Source and dictionary versions must survive mapping changes. Treat ACP/Perkins exports as planning records requiring jurisdiction-specific validation.

## Verification
Run npm run lint, npm test, npm run build, and browser desktop/mobile end-to-end checks. Cover privacy, canonical mapping, source fallback, cache isolation, idempotency, provider failure, and persistence. No raw secrets or transcripts in tests/logs.

## Reading load
Children see one short response at a time, not four paragraphs. Explorer generated pillars have at most 12 words; Builder at most 20. Use visual prompt choices, one-sentence card meanings, one mission step per screen, and a one-sentence reflection prompt. Keep fuller sources, explanations, and evidence details behind disclosure controls or in adult views. Shorter text must remain legible; do not reduce reading load by shrinking typography.

## Artistic Intelligence and interaction craft
The visible closing signature is **Made with Artistic Intelligence [AI]**. Preserve the low-reading child flow when refining the visual design. Use locally served, licensed display typography; meaningful geometric symbols; shared easing tokens; and brief feedback tied to actual actions. Mobile capability cards use a keyboard-accessible scroll region with readable text. Respect reduced motion, maintain visible keyboard focus, and keep the Wonder → Try → Reflect trail tied to discovery and self-reported build state. Do not imply that a visual progress indicator verifies mastery.


## Product and company names
The product is **Curio City**. The developer/company is **Build Your Dreaming Things (BYDT)**. Use “Curio City — by BYDT” in product identity; preserve the Artistic Intelligence closing signature. Internal BYDT dictionary/schema names may remain stable for compatibility.

## Deployment
Local development and tests use SQLite; Vercel uses the tracked PostgreSQL schema and migrations under prisma/postgres. Never deploy an ephemeral SQLite ledger as if it were persistent. Keep secrets, local databases, generated research imagery, and execution-environment state out of source control. Hosted deployment remains a synthetic-data demonstration, not a real-child release.
