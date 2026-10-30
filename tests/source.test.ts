import { it, expect } from "vitest";
import snapshot from "../src/lib/onet/source-snapshot.json";
import { seedDictionary } from "../src/lib/bydt/dictionary";
import { fixtureData, fixtureBundle } from "../src/lib/onet/fixtures";
it("every canonical mapping matches the official 31.0 content model", () => {
  for (const card of seedDictionary) {
    const source = snapshot.elements.find(
      (e) => e["Element ID"] === card.onetElementId,
    );
    expect(source?.["Element Name"]).toBe(card.rawOnetName);
  }
});
it("fixture raw summaries and DWA occupation links match source records", () => {
  for (const f of fixtureData) {
    const b = fixtureBundle(f.soc, "en");
    expect(b.occupation.description).toBe(
      snapshot.occupations.find((o) => o["O*NET-SOC Code"] === f.soc)
        ?.Description,
    );
    expect(
      snapshot.occupationDwaLinks.some(
        (l) =>
          l["O*NET-SOC Code"] === f.soc && l["DWA Element ID"] === b.dwas[0].id,
      ),
    ).toBe(true);
  }
});
