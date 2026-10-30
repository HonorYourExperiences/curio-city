import { z } from "zod";
import type { Bundle, Lang, Occupation } from "../../types/bydt";
import { scrubPII } from "../safety/coppa-guard";
import { fixtureBundle, searchFixtures } from "./fixtures";
const row = z
  .object({
    code: z.string(),
    title: z.string(),
    description: z.string().optional(),
    tags: z.object({ bright_outlook: z.boolean().optional() }).optional(),
  })
  .passthrough();
type Config = {
  apiKey?: string;
  username?: string;
  password?: string;
  live?: boolean;
  fetcher?: typeof fetch;
  now?: () => number;
  ttl?: number;
};
export class OnetClient {
  private cache = new Map<string, { until: number; value: Bundle }>();
  private versionCache?: { until: number; value: string };
  private config: Config;
  private fetcher: typeof fetch;
  private now: () => number;
  lastNotice = "Demonstration fixtures; not a complete O*NET search.";
  constructor(
    config: Config = {
      apiKey: process.env.ONET_API_KEY,
      username: process.env.ONET_USERNAME,
      password: process.env.ONET_PASSWORD,
      live: process.env.BYDT_LIVE_APIS === "true",
    },
  ) {
    this.config = config;
    this.fetcher = config.fetcher ?? fetch;
    this.now = config.now ?? Date.now;
  }
  private async request(path: string) {
    const adapters: { base: string; headers: Record<string, string> }[] = [];
    if (this.config.apiKey)
      adapters.push({
        base: "https://api-v2.onetcenter.org",
        headers: { "X-API-Key": this.config.apiKey },
      });
    if (this.config.username && this.config.password)
      adapters.push({
        base: "https://services.onetcenter.org/ws",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64")}`,
        },
      });
    for (const adapter of adapters) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await this.fetcher(`${adapter.base}${path}`, {
            headers: { ...adapter.headers, Accept: "application/json" },
            signal: AbortSignal.timeout(7000),
            cache: "no-store",
          });
          if (response.status === 429 && attempt === 0) {
            await new Promise((r) => setTimeout(r, 250));
            continue;
          }
          if (!response.ok) break;
          return (await response.json()) as unknown;
        } catch {
          break;
        }
      }
    }
    throw new Error("O*NET unavailable");
  }
  private async sourceVersion() {
    if (this.versionCache && this.versionCache.until > this.now())
      return this.versionCache.value;
    const about = z
      .object({ database: z.object({ name: z.string() }) })
      .parse(await this.request("/about/"));
    this.versionCache = {
      until: this.now() + 86400000,
      value: about.database.name,
    };
    return about.database.name;
  }
  async searchOccupations(
    query: string,
    language: Lang,
  ): Promise<Occupation[]> {
    const clean = scrubPII(query).cleanText.slice(0, 160);
    if (this.config.live)
      try {
        const raw = await this.request(
          `/${language === "es" ? "mpp" : "mnm"}/search?keyword=${encodeURIComponent(clean || "engineer")}&start=1&end=12`,
        );
        const result = z.object({ career: z.array(row) }).parse(raw);
        if (!result.career.length) {
          this.lastNotice = "O*NET Web Services · No matching careers.";
          return [];
        }
        const version = await this.sourceVersion();
        const occupations = await Promise.all(
          result.career.slice(0, 8).map(async (r) => {
            const raw = await this.request(
              language === "es"
                ? `/mpp/careers/${r.code}/`
                : `/online/occupations/${r.code}/`,
            );
            const summary = z
              .object({
                title: z.string(),
                description: z.string().optional(),
                what_they_do: z.string().optional(),
                tags: z
                  .object({ bright_outlook: z.boolean().optional() })
                  .optional(),
              })
              .parse(raw);
            return {
              socCode: r.code,
              title: summary.title,
              description:
                (language === "es"
                  ? summary.what_they_do
                  : summary.description) ?? "",
              brightOutlook: summary.tags?.bright_outlook ?? false,
              sourceMode: "live" as const,
              sourceVersion: version,
              language,
            };
          }),
        );
        this.lastNotice = `O*NET Web Services · ${version}`;
        return occupations;
      } catch {
        this.lastNotice =
          "O*NET is unavailable. Showing clearly labeled demonstration fixtures.";
      }
    return searchFixtures(clean, language);
  }
  async getOccupationBundle(
    socCode: string,
    language: Lang = "en",
  ): Promise<Bundle> {
    if (!/^\d{2}-\d{4}\.\d{2}$/.test(socCode))
      throw new Error("Invalid SOC code");
    if (this.versionCache && this.versionCache.until <= this.now()) {
      this.cache.clear();
      this.versionCache = undefined;
    }
    const key = `${this.config.live ? "live" : "fixture"}:v2-v1.9:31:${language}:${socCode}`;
    const hit = this.cache.get(key);
    if (hit && hit.until > this.now()) return hit.value;
    let bundle: Bundle;
    if (this.config.live)
      try {
        const version = await this.sourceVersion();
        const prefix = `/online/occupations/${socCode}`;
        const [overview, skills, abilities, styles, activities] =
          await Promise.all([
            this.request(`${prefix}/`),
            this.request(`${prefix}/details/skills?start=1&end=2000`),
            this.request(`${prefix}/details/abilities?start=1&end=2000`),
            this.request(`${prefix}/details/work_styles?start=1&end=2000`),
            this.request(
              `${prefix}/summary/detailed_work_activities?start=1&end=2000`,
            ),
          ]);
        const occupation = row.parse(overview);
        const elements = [
          ...this.elements(skills, "Skill"),
          ...this.elements(abilities, "Ability"),
          ...this.elements(styles, "WorkStyle"),
        ];
        const dwas = this.activities(activities);
        let title = occupation.title;
        let description = occupation.description ?? "";
        if (language === "es") {
          const es = z
            .object({ title: z.string(), what_they_do: z.string() })
            .parse(await this.request(`/mpp/careers/${socCode}/`));
          title = es.title;
          description = es.what_they_do;
        }
        bundle = {
          occupation: {
            socCode,
            title,
            description,
            brightOutlook: occupation.tags?.bright_outlook ?? false,
            sourceMode: "live",
            sourceVersion: version,
            language,
          },
          elements,
          dwas,
        };
      } catch {
        this.lastNotice = "Live bundle unavailable; demonstration fallback.";
        bundle = fixtureBundle(socCode, language);
      }
    else bundle = fixtureBundle(socCode, language);
    if (this.cache.size >= 256)
      this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, {
      value: bundle,
      until:
        this.now() +
        (bundle.occupation.sourceMode === "fixture" && this.config.live
          ? 60000
          : (this.config.ttl ?? 86400000)),
    });
    return bundle;
  }
  private elements(raw: unknown, domain: "Ability" | "Skill" | "WorkStyle") {
    const data = z
      .object({
        element: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            importance: z.number().optional(),
          }),
        ),
      })
      .parse(raw);
    return data.element
      .filter((e) => e.importance === undefined || e.importance >= 40)
      .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
      .slice(0, 12)
      .map((e) => ({
        id: e.id,
        name: e.name,
        domain,
        importance: e.importance,
      }));
  }
  private activities(raw: unknown) {
    const data = z
      .object({
        activity: z.array(z.object({ id: z.string(), title: z.string() })),
      })
      .parse(raw);
    return data.activity.map((a) => ({ id: a.id, name: a.title }));
  }
}
export const onetClient = new OnetClient();
