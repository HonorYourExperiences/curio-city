import { describe, it, expect, vi } from "vitest";
import { scrubPII, discardAudio } from "../src/lib/safety/coppa-guard";
import { OnetClient } from "../src/lib/onet/client";
import { mapCards, seedDictionary } from "../src/lib/bydt/dictionary";
import { detectCircumscription, transform } from "../src/lib/bydt/chat-engine";
import { fixtureBundle, searchFixtures } from "../src/lib/onet/fixtures";
import { missionFor } from "../src/lib/bydt/missions";
import { TryItMission, CapeAbilityCard } from "../src/types/bydt";
describe("privacy boundary", () => {
  it.each([
    ["My name is Alex Smith. I want to build.", "Alex Smith"],
    ["Me llamo Ana García. Quiero construir.", "Ana García"],
    ["my school is Hill Academy. I like paper.", "Hill Academy"],
    ["mi escuela es Colegio Sol. Me gusta crear.", "Colegio Sol"],
    ["Find me @maker.kid or alex@example.com", "alex@example.com"],
    ["Call +1 (212) 555-0123.", "555-0123"],
    ["I live at 123 Main Street.", "123 Main Street"],
    ["Vivo en calle Luna 24.", "calle Luna 24"],
  ])("redacts common identifiers: %s", (input, removed) => {
    const result = scrubPII(input);
    expect(result.cleanText).not.toContain(removed);
    expect(result.redactions.length).toBeGreaterThan(0);
    expect(result.redactions.join()).not.toContain(removed);
  });
  it("preserves curiosity without identifying content", () =>
    expect(scrubPII("I want to build a paper bridge").cleanText).toBe(
      "I want to build a paper bridge",
    ));
  it("clears audio and never transcribes", async () => {
    const buffer = Buffer.from("sensitive audio");
    const result = await discardAudio(buffer);
    expect(result.disabled).toBe(true);
    expect(buffer.every((v) => v === 0)).toBe(true);
  });
});
describe("canonical mappings", () => {
  it("has 20 unique valid cards", () => {
    expect(seedDictionary).toHaveLength(20);
    expect(new Set(seedDictionary.map((c) => c.onetElementId)).size).toBe(20);
    seedDictionary.forEach((c) =>
      expect(CapeAbilityCard.safeParse(c).success).toBe(true),
    );
  });
  it("maps only known IDs deterministically", () => {
    expect(mapCards(["unknown", "1.A.1.f.2"])).toEqual([seedDictionary[0]]);
    expect(mapCards(["unknown"])).toEqual([]);
  });
  it("bounds all curated missions and materials", () => {
    for (const lang of ["en", "es"] as const) {
      const m = missionFor(fixtureBundle("17-2051.00", lang), lang);
      expect(TryItMission.safeParse(m).success).toBe(true);
      expect(m.steps).toHaveLength(4);
    }
  });
  it("detects circumscription without assigning aptitude", () => {
    expect(detectCircumscription("Girls cannot build machines")).toBe(true);
    expect(detectCircumscription("I am bad at math")).toBe(true);
    expect(detectCircumscription("I like paper")).toBe(false);
  });
  it("returns bilingual deterministic valid responses without credentials", async () => {
    const out = await transform(
      "Quiero construir un puente",
      "Explorer_6_8",
      "es",
    );
    expect(out.generationMode).toBe("deterministic");
    expect(out.unlockedCards.length).toBeGreaterThanOrEqual(2);
    expect(out.launchpadMission.title).toContain("puente");
  });
});
describe("O*NET adapters and cache", () => {
  it("works without credentials and distinguishes languages", async () => {
    const client = new OnetClient();
    const first = await client.getOccupationBundle("17-2051.00");
    const start = performance.now();
    expect(await client.getOccupationBundle("17-2051.00")).toBe(first);
    expect(performance.now() - start).toBeLessThan(10);
    const es = await client.getOccupationBundle("17-2051.00", "es");
    expect(es.occupation.title).not.toBe(first.occupation.title);
    expect(es.occupation.sourceMode).toBe("fixture");
  });
  it("expires cache and rejects unknown SOC", async () => {
    let time = 0;
    const c = new OnetClient({ now: () => time, ttl: 100 });
    const first = await c.getOccupationBundle("17-2051.00");
    time = 101;
    expect(await c.getOccupationBundle("17-2051.00")).not.toBe(first);
    await expect(c.getOccupationBundle("../bad")).rejects.toThrow();
  });
  it("falls back after provider error without leaking credentials", async () => {
    const fetcher = vi.fn(
      async () => new Response("{}", { status: 503 }),
    ) as unknown as typeof fetch;
    const c = new OnetClient({ live: true, apiKey: "test-key", fetcher });
    const result = await c.searchOccupations("bridge", "en");
    expect(result[0].sourceMode).toBe("fixture");
    expect(JSON.stringify(result)).not.toContain("test-key");
  });
  it("uses v2 header and documented activity shape", async () => {
    const calls: { url: string; headers: Headers }[] = [];
    const fetcher = vi.fn(async (url, init) => {
      calls.push({ url: String(url), headers: new Headers(init?.headers) });
      const path = String(url);
      const body = path.includes("/about/")
        ? { database: { name: "O*NET 31.0 Database" } }
        : path.includes("detailed_work_activities")
          ? { activity: [{ id: "4.A.demo", title: "Draft plans" }] }
          : path.includes("/details/")
            ? { element: [{ id: "1.A.1.f.2", name: "Visualization" }] }
            : {
                code: "17-2051.00",
                title: "Civil Engineers",
                description: "Official description",
                tags: { bright_outlook: true },
              };
      return Response.json(body);
    }) as unknown as typeof fetch;
    const c = new OnetClient({ live: true, apiKey: "test-key", fetcher });
    const b = await c.getOccupationBundle("17-2051.00");
    expect(b.occupation.sourceMode).toBe("live");
    expect(b.dwas[0].name).toBe("Draft plans");
    expect(calls.every((c) => c.headers.get("X-API-Key") === "test-key")).toBe(
      true,
    );
    expect(calls.every((c) => !c.url.includes("test-key"))).toBe(true);
  });
  it("falls back to legacy Basic Auth when v2 fails", async () => {
    const headers: Headers[] = [];
    const fetcher = vi.fn(async (url, init) => {
      const h = new Headers(init?.headers);
      headers.push(h);
      if (String(url).includes("api-v2"))
        return new Response("{}", { status: 503 });
      return Response.json({ career: [] });
    }) as unknown as typeof fetch;
    const c = new OnetClient({
      live: true,
      apiKey: "test",
      username: "user",
      password: "pass",
      fetcher,
    });
    expect(await c.searchOccupations("bridge", "es")).toEqual([]);
    expect(
      headers.some((h) => h.get("Authorization")?.startsWith("Basic ")),
    ).toBe(true);
  });
});
describe("additional PII name contexts", () => {
  it.each([
    "I'm Alex Smith and I like paper.",
    "I am Maria Garcia.",
    "Soy Ana García.",
    "my friend Emma likes bridges.",
  ])("filters %s", (input) =>
    expect(scrubPII(input).redactions).toContain("name"),
  );
});

it("curiosity keywords route to relevant occupations rather than matching common words", () => {
  expect(searchFixtures("I want to help a friend", "en")[0].socCode).toBe(
    "25-2021.00",
  );
  expect(searchFixtures("How do machines work?", "en")[0].socCode).toBe(
    "17-2141.00",
  );
  expect(searchFixtures("Quiero construir un puente", "es")[0].socCode).toBe(
    "17-2051.00",
  );
});
