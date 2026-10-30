import { z } from "zod";
import { GradeBand, Language } from "../../../types/bydt";
import { transform } from "../../../lib/bydt/chat-engine";
import { recordDiscovery } from "../../../lib/bydt/passport";
import {
  failure,
  profileSchema,
  readJson,
  sameOrigin,
} from "../../../lib/http";
export const runtime = "nodejs";
const Input = z
  .object({
    message: z.string().trim().min(1).max(1500),
    gradeBand: GradeBand,
    language: Language,
    profileId: profileSchema,
    socCode: z
      .string()
      .regex(/^\d{2}-\d{4}\.\d{2}$/)
      .optional(),
    currentPassport: z.unknown().optional(),
  })
  .refine(
    (d) =>
      d.profileId ===
      (d.gradeBand === "Explorer_6_8" ? "demo-explorer" : "demo-builder"),
    { message: "Profile and grade band must match" },
  );
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = Input.parse(await readJson(request));
    const response = await transform(
      data.message,
      data.gradeBand,
      data.language,
      data.socCode,
    );
    await recordDiscovery(
      data.profileId,
      data.gradeBand,
      data.language,
      data.message,
      response,
    );
    return Response.json(response);
  } catch (error) {
    return failure(error);
  }
}
