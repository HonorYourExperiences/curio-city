import { it, expect, afterAll, beforeAll } from "vitest";
import { db } from "../src/lib/db";
import { transform } from "../src/lib/bydt/chat-engine";
import {
  recordDiscovery,
  getPassport,
  completeMission,
  reviewMission,
} from "../src/lib/bydt/passport";
import { POST as chatRoute } from "../src/app/api/chat/route";
import { POST as voiceRoute } from "../src/app/api/voice-transcribe/route";
beforeAll(async () => {
  await db.profile.deleteMany({ where: { id: "demo-builder" } });
});
afterAll(async () => {
  await db.profile.deleteMany({ where: { id: "demo-builder" } });
  await db.$disconnect();
});
it("records separate stages, scrubs all persisted text, and completes idempotently", async () => {
  const response = await transform("build a bridge", "Builder_9_13", "en");
  await recordDiscovery(
    "demo-builder",
    "Builder_9_13",
    "en",
    "My name is Alex Smith. I like paper.",
    response,
  );
  const first = await getPassport("demo-builder");
  expect(first.entries).toHaveLength(1);
  expect(first.entries[0].stage).toBe("discovered");
  expect(first.entries[0].completedMissionId).toBeNull();
  await expect(
    reviewMission("demo-builder", response.assignmentId, "review"),
  ).rejects.toThrow();
  await completeMission(
    "demo-builder",
    response.assignmentId,
    "I tested at 123 Main Street. It held.",
  );
  await completeMission("demo-builder", response.assignmentId, "duplicate");
  await reviewMission(
    "demo-builder",
    response.assignmentId,
    "Email alex@example.com reviewed.",
  );
  const second = await getPassport("demo-builder");
  expect(second.entries.map((e) => e.stage)).toEqual([
    "discovered",
    "self_reported",
    "adult_reviewed",
  ]);
  expect(JSON.stringify(second)).not.toContain("Alex Smith");
  expect(JSON.stringify(second)).not.toContain("123 Main Street");
  expect(JSON.stringify(second)).not.toContain("alex@example.com");
  await expect(
    completeMission("demo-explorer", response.assignmentId, "forged"),
  ).rejects.toThrow();
  await db.$disconnect();
  expect((await getPassport("demo-builder")).entries).toHaveLength(3);
  await db.profile.deleteMany({ where: { id: "demo-builder" } });
  expect((await getPassport("demo-builder")).entries).toHaveLength(0);
  expect(
    await db.assignment.count({ where: { profileId: "demo-builder" } }),
  ).toBe(0);
});
it("rejects malformed or cross-origin chat writes", async () => {
  const r = await chatRoute(
    new Request("http://localhost/api/chat", { method: "POST", body: "{}" }),
  );
  expect(r.status).toBe(400);
  const cross = await chatRoute(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { Origin: "https://untrusted.example" },
      body: "{}",
    }),
  );
  expect(cross.status).toBe(400);
});
it("voice route stays disabled and rejects oversized streams", async () => {
  const r = await voiceRoute(
    new Request("http://localhost/api/voice-transcribe", {
      method: "POST",
      body: "audio",
    }),
  );
  expect(r.status).toBe(501);
  expect((await r.json()).disabled).toBe(true);
  const large = await voiceRoute(
    new Request("http://localhost/api/voice-transcribe", {
      method: "POST",
      body: "x",
      headers: { "content-length": "1048577" },
    }),
  );
  expect(large.status).toBe(413);
});
