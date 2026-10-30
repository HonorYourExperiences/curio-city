# Verification record

Local demonstration, checked 2026-10-30.

- `npm run lint`: passed.
- `npm test`: 31 tests passed across privacy, audio cleanup, source integrity, canonical mapping, model-output rejection, keyword routing, source/cache fallback, and persistent evidence.
- `npm run build`: passed; Next.js production build and strict TypeScript checks are clean.
- `npm run test:e2e`: four browser tests cover the full offline evidence loop, timer/reload, adult review/export, parent preparation, bilingual public search, occupation deep-linking, Builder Spanish generation, mobile overflow, and public empty/provider-error states. No browser runtime errors in the core flow.
- Warm in-memory lookup is checked against the requested <10 ms local target. This is a local measurement, not a hosted latency guarantee.

## Visual review

The full-screen design reference is `generated_images/exec-5ed0a34a-146f-4089-b85f-6f4e151fb67a.png`. It established the lavender background, warm paper panels, coral/purple actions, split workshop, pastel deck, and shared adult views. The user's reading-load correction takes precedence over the original concept's longer copy.

Playwright used local Chromium because the browser CLI (`webcmd`) was unavailable. Desktop viewport: 1505 × 1045, matching the generated reference's native dimensions. Mobile viewport: 390 × 844. Browser screenshots are temporary `/tmp/bydt-desktop.png`, `/tmp/bydt-active.png`, `/tmp/bydt-mobile.png`, and `/tmp/bydt-passport.png`; they are not application assets. Finite animations are disabled during capture so a mid-animation card is not mistaken for missing content.

| Comparison | Reference / intended behavior | Implementation and review |
| --- | --- | --- |
| Palette | Lavender canvas, warm paper, coral/purple accents | Shared CSS tokens retain the visual system across all tabs. |
| Layout | Conversation left, collectible deck and mission right | Split desktop layout; single-column mobile without horizontal overflow. |
| Typography | Strong headline and readable controls | Increased card title/meaning sizes; short instructions use large text. |
| Copy | Workshop, For grown-ups, Skill passport, curiosity prompt | Navigation retained. Intentional shorter child copy, synthetic-demo disclosure, corrected age bands, and actual evidence stages. |
| Card treatment | Three pastel capability cards with clear visual motifs | Consistent icon geometry, stable colors, canonical meanings, optional source details. |
| Progress | Curiosity leads into offline action | One pillar and one mission step at a time; reflection and persisted evidence tested. |
| Adult views | Preparation support and evidence timeline | Dedicated tabs use the same visual system and real synthetic ledger data. |

Intentional differences: restrained vector icons instead of dimensional concept icons; the concept's age range is corrected to the requested 6–8/9–13 bands; no unsupported safety claims, sample success history, or capability-proficiency dots. Mission preview is assigned after curiosity is submitted. Adult mockup thumbnails are implemented as functioning tabs. The copy audit reflects these intentional changes; no unrelated product sections were added.

Visual comparison uses `view_image` on the design reference and latest desktop/mobile/passport captures. The implementation follows the reference visual system with the intentional reading-load and evidence-integrity changes above; it is not a pixel-for-pixel reproduction of the original copy.

## Limits

No credentials were available to test real OpenAI or authenticated O*NET calls. Live adapters use official contracts and simulated provider responses. The four-occupation mission catalog and synthetic profiles are deliberate MVP limits. PII redaction is heuristic. Voice, consent, authentication, and official education reporting are not represented as production-ready services.


## Artistic Intelligence critique — executed

A fresh mobile audit found the build CTA roughly 1,525 px below the top, a non-interactive “Ready to build” final dialogue state, and a completed mission inviting another “Let’s build” on reload. The changes now put an assigned mission before its capability cards in both DOM and visual order, replace the dead end with a keyboard-accessible “Try it offline” action that focuses the mission, and restore a saved-build return state from persisted evidence. Repeated curiosity prompts and the large introductory headline are removed during an active session. No discovery is promoted to verified mastery by these visual changes.

The four browser tests now include the explicit mobile handoff, completed-session reload, EN/ES labels, keyboard focus, scrollable cards, reduced-motion behavior, and separate self-report/adult-review records. The product identity is Curio City, developed by BYDT; the closing signature is Made with Artistic Intelligence [AI].

Deployment configuration now includes a separate PostgreSQL Prisma schema and tracked migrations for Vercel, while local development/tests retain SQLite. Hosted persistence still requires a configured PostgreSQL database; schema validation is not a claim that a live database has been provisioned.
