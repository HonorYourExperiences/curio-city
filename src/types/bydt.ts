import { z } from "zod";
export const GradeBand = z.enum(["Explorer_6_8", "Builder_9_13"]);
export const Language = z.enum(["en", "es"]);
export const OnetOccupationSummary = z.object({
  socCode: z.string(),
  title: z.string(),
  description: z.string(),
  brightOutlook: z.boolean(),
  sourceMode: z.enum(["live", "fixture"]),
  sourceVersion: z.string(),
  language: Language,
});
export const OnetElement = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(["Ability", "WorkStyle", "Skill"]),
  importance: z.number().optional(),
});
export const OnetDwa = z.object({ id: z.string(), name: z.string() });
export const CapeAbilityCard = z.object({
  id: z.string(),
  onetElementId: z.string(),
  domain: z.enum(["Ability", "WorkStyle", "Skill"]),
  rawOnetName: z.string(),
  capeAbilityTitle: z.string(),
  explorerMeaning: z.string(),
  builderMeaning: z.string(),
  realWorldBuilders: z.array(z.string()),
  es: z.object({
    title: z.string(),
    explorer: z.string(),
    builder: z.string(),
  }),
  dictionaryVersion: z.string(),
});
export const TryItMission = z.object({
  missionId: z.string(),
  linkedSocCode: z.string(),
  linkedDwa: OnetDwa,
  title: z.string(),
  materials: z.array(z.string()),
  durationMinutes: z.number().int().min(15).max(45),
  steps: z.array(z.string()),
  masteryReflectionPrompt: z.string(),
  supervision: z.string(),
});
export const PassportLedgerEntry = z.object({
  id: z.string(),
  timestamp: z.string(),
  profileId: z.string(),
  assignmentId: z.string(),
  gradeBand: GradeBand,
  language: Language,
  scrubbedInterest: z.string(),
  unlockedCapeAbilityIds: z.array(z.string()),
  completedMissionId: z.string().nullable(),
  masteryReflection: z.string().nullable(),
  perkinsCluster: z.string(),
  stage: z.enum(["discovered", "self_reported", "adult_reviewed"]),
  sourceMode: z.enum(["live", "fixture"]),
  sourceVersion: z.string(),
  dictionaryVersion: z.string(),
  clusterMappingVersion: z.string(),
  onetElementIds: z.array(z.string()),
  dwaId: z.string(),
});
export const ChatResponse = z.object({
  journeyResponse: z.object({
    reflective: z.string(),
    narrative: z.string(),
    persuasive: z.string(),
    instructional: z.string(),
  }),
  unlockedCards: z.array(CapeAbilityCard).min(2).max(3),
  launchpadMission: TryItMission,
  sourceMode: z.enum(["live", "fixture"]),
  generationMode: z.enum(["live", "deterministic"]),
  sourceNotice: z.string(),
  sourceVersion: z.string(),
  language: Language,
  assignmentId: z.string(),
});
export type Card = z.infer<typeof CapeAbilityCard>;
export type Mission = z.infer<typeof TryItMission>;
export type Entry = z.infer<typeof PassportLedgerEntry>;
export type Chat = z.infer<typeof ChatResponse>;
export type Band = z.infer<typeof GradeBand>;
export type Lang = z.infer<typeof Language>;
export type Occupation = z.infer<typeof OnetOccupationSummary>;
export type Bundle = {
  occupation: Occupation;
  elements: z.infer<typeof OnetElement>[];
  dwas: z.infer<typeof OnetDwa>[];
};
