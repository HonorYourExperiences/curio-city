# Source integrity and integration notes

Verified 2026-10-30 against the official O*NET 31.0 text database:
https://www.onetcenter.org/dl_files/database/db_31_0_text.zip

The small `src/lib/onet/source-snapshot.json` records the archive SHA-256 and the exact selected rows from Content Model Reference, Occupation Data, Tasks to DWAs, GWAs to IWAs to DWAs, Abilities, Transferable Skills, and Work Styles. Source tests verify all 20 dictionary names/IDs and all four occupation/DWA links. BYDT's occupation-to-card selection, Spanish fixture text, age-band meanings, cluster mappings, and mission adaptations are editorial additions, not raw O*NET measures.

Important version correction: 31.0 Work Styles use `1.D` IDs. Older `1.C` mappings in earlier examples are retired. The current terms are **Perseverance**, **Intellectual Curiosity**, and **Tolerance for Ambiguity**. Work Style ratings now include WI and DR scales; do not interpret them as ability test scores. The claimed descriptor counts in the original brief were not used as schema constraints.

Live contracts checked against:
- https://services.onetcenter.org/reference/openapi.json
- https://services.onetcenter.org/reference/start/overview
- https://services.onetcenter.org/terms

v2 base: `https://api-v2.onetcenter.org`, `X-API-Key` header. Legacy base: `https://services.onetcenter.org/ws`, Basic Authorization. Search: `/mnm/search` or `/mpp/search`. English occupation overview uses `description`; Spanish `/mpp/careers/{code}/` uses `what_they_do`. Detailed work activities use `activity: [{ id, title }]`, not `element`. `/about/` supplies the actual live database version. No API credentials were available for live authenticated verification; adapter tests use documented shapes and simulated failures.

Raw source content remains publicly accessible at `/explore`; the footer links to O*NET Web Services, USDOL/ETA attribution, CC BY 4.0, and the terms. The terms require prominent source attribution, registration of the developer application, and address paid/registration-required services. A public route alone does not establish complete licensing compliance. BYDT additions are labeled as adaptations with no USDOL/ETA endorsement.

The demo contains four occupations and verified English raw summaries. Spanish fixture summaries are BYDT adaptations, not official Mi Próximo Paso text. Bright Outlook rendering is implemented for live data; fixture status is explicitly unverified. Live data is not pinned to 31.0 because the provider updates its current database; actual version metadata travels into each evidence record.

The mission catalog intentionally covers these four occupations only. Other occupations can be publicly explored, but do not receive fabricated mission-to-DWA links. Expand verified curated mappings before using the workshop with additional live occupations.
