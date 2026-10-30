import { it, expect } from "vitest";
import { validateGeneration } from "../src/lib/bydt/generation";
import { seedDictionary } from "../src/lib/bydt/dictionary";
const valid = {
  reflective: "You like making things.",
  narrative: "Designers test their ideas.",
  persuasive: "Practice helps you grow.",
  instructional: "Try a paper bridge.",
  cardIds: ["cape-1", "cape-2"],
};
it("rejects fabricated, duplicate, malformed and verbose model output", () => {
  expect(validateGeneration(valid, seedDictionary, "Explorer_6_8")).toEqual(
    valid,
  );
  for (const data of [
    { ...valid, cardIds: ["cape-1", "fake"] },
    { ...valid, cardIds: ["cape-1", "cape-1"] },
    { ...valid, reflective: "word ".repeat(13) },
    null,
    { refusal: "No response" },
  ])
    expect(() =>
      validateGeneration(data, seedDictionary, "Explorer_6_8"),
    ).toThrow();
});
