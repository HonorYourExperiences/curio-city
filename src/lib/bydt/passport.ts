import { db } from "../db";
import {
  PassportLedgerEntry,
  ChatResponse,
  type Band,
  type Lang,
  type Chat,
  type Entry,
} from "../../types/bydt";
import { scrubPII } from "../safety/coppa-guard";
import { fixtureData } from "../onet/fixtures";
export const PROFILE_IDS = ["demo-explorer", "demo-builder"] as const;
export function requireProfile(id: string) {
  if (!PROFILE_IDS.includes(id as (typeof PROFILE_IDS)[number]))
    throw new Error("Unknown demo profile");
  return id;
}
export async function getPassport(profileId: string) {
  requireProfile(profileId);
  const [events, assignments] = await Promise.all([
    db.evidence.findMany({
      where: { profileId },
      orderBy: { timestamp: "asc" },
    }),
    db.assignment.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);
  return {
    entries: events.map((e) =>
      PassportLedgerEntry.parse({
        ...JSON.parse(e.payload),
        id: e.id,
        timestamp: e.timestamp.toISOString(),
      }),
    ),
    activeAssignment: assignments[0]
      ? ChatResponse.parse(JSON.parse(assignments[0].payload).response)
      : null,
  };
}
export async function recordDiscovery(
  profileId: string,
  gradeBand: Band,
  language: Lang,
  interest: string,
  response: Chat,
) {
  requireProfile(profileId);
  const mission = response.launchpadMission;
  const entry: Omit<Entry, "id" | "timestamp"> = {
    profileId,
    assignmentId: response.assignmentId,
    gradeBand,
    language,
    scrubbedInterest: scrubPII(interest).cleanText,
    unlockedCapeAbilityIds: response.unlockedCards.map((c) => c.id),
    completedMissionId: null,
    masteryReflection: null,
    perkinsCluster:
      fixtureData.find((d) => d.soc === mission.linkedSocCode)?.cluster ??
      "Unmapped",
    stage: "discovered",
    sourceMode: response.sourceMode,
    sourceVersion: response.sourceVersion,
    dictionaryVersion: "bydt-1.0",
    clusterMappingVersion: "legacy-16-demo-v1",
    onetElementIds: response.unlockedCards.map((c) => c.onetElementId),
    dwaId: mission.linkedDwa.id,
  };
  await db.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: profileId },
      create: { id: profileId },
      update: {},
    });
    await tx.assignment.create({
      data: {
        id: response.assignmentId,
        profileId,
        payload: JSON.stringify({ response, entry }),
      },
    });
    await tx.evidence.create({
      data: {
        profileId,
        assignmentId: response.assignmentId,
        stage: "discovered",
        payload: JSON.stringify(entry),
      },
    });
  });
}
export async function completeMission(
  profileId: string,
  assignmentId: string,
  reflection: string,
) {
  requireProfile(profileId);
  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, profileId },
  });
  if (!assignment) throw new Error("Assignment not found");
  const { entry, response } = JSON.parse(assignment.payload) as {
    entry: Entry;
    response: Chat;
  };
  const clean = scrubPII(reflection).cleanText.trim();
  if (!clean || clean.length > 2000)
    throw new Error("A short reflection is required");
  return db.evidence.upsert({
    where: { assignmentId_stage: { assignmentId, stage: "self_reported" } },
    update: {},
    create: {
      profileId,
      assignmentId,
      stage: "self_reported",
      payload: JSON.stringify({
        ...entry,
        stage: "self_reported",
        completedMissionId: response.launchpadMission.missionId,
        masteryReflection: clean,
      }),
    },
  });
}
export async function reviewMission(
  profileId: string,
  assignmentId: string,
  note: string,
) {
  requireProfile(profileId);
  const completed = await db.evidence.findFirst({
    where: { profileId, assignmentId, stage: "self_reported" },
  });
  if (!completed) throw new Error("Complete a mission before reviewing");
  return db.evidence.upsert({
    where: { assignmentId_stage: { assignmentId, stage: "adult_reviewed" } },
    update: {},
    create: {
      profileId,
      assignmentId,
      stage: "adult_reviewed",
      payload: JSON.stringify({
        ...JSON.parse(completed.payload),
        stage: "adult_reviewed",
        masteryReflection:
          scrubPII(note).cleanText || "Demo adult reviewed the reflection.",
      }),
    },
  });
}
