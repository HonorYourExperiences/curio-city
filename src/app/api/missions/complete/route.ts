import { z } from "zod";
import { completeMission } from "../../../../lib/bydt/passport";
import {
  failure,
  profileSchema,
  readJson,
  sameOrigin,
} from "../../../../lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = z
      .object({
        profileId: profileSchema,
        assignmentId: z.string().uuid(),
        reflection: z.string().trim().min(1).max(2000),
      })
      .parse(await readJson(request));
    const result = await completeMission(
      data.profileId,
      data.assignmentId,
      data.reflection,
    );
    return Response.json({ id: result.id, stage: result.stage });
  } catch (error) {
    return failure(error);
  }
}
