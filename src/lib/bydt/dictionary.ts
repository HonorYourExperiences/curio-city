import { seedDictionary } from "./seed-dictionary";
export { seedDictionary };
export function mapCards(ids: string[]) {
  const matches = seedDictionary.filter((c) => ids.includes(c.onetElementId));
  const chosen = ["Ability", "WorkStyle", "Skill"].flatMap(
    (domain) => matches.find((c) => c.domain === domain) ?? [],
  );
  return [...chosen, ...matches.filter((c) => !chosen.includes(c))].slice(0, 3);
}
