import { z } from "zod";
import type { Band, Card } from "../../types/bydt";
export const Generated = z.object({
  reflective: z.string().max(220),
  narrative: z.string().max(220),
  persuasive: z.string().max(220),
  instructional: z.string().max(220),
  cardIds: z.array(z.string()).min(2).max(3),
});
export function validateGeneration(input: unknown, cards: Card[], band: Band) {
  const v = Generated.parse(input);
  if (
    v.cardIds.some((id) => !cards.some((c) => c.id === id)) ||
    new Set(v.cardIds).size !== v.cardIds.length
  )
    throw new Error("Invalid generated card");
  for (const sentence of [
    v.reflective,
    v.narrative,
    v.persuasive,
    v.instructional,
  ])
    if (
      sentence.trim().split(/\s+/).length > (band === "Explorer_6_8" ? 12 : 20)
    )
      throw new Error("Response too long");
  return v;
}
