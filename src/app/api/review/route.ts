import { z } from "zod";
import { reviewMission } from "../../../lib/bydt/passport";
import {
  failure,
  profileSchema,
  readJson,
  sameOrigin,
} from "../../../lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = z
      .object({
        profileId: profileSchema,
        assignmentId: z.string().uuid(),
        note: z.string().max(1000),
      })
      .parse(await readJson(request));
    const result = await reviewMission(
      data.profileId,
      data.assignmentId,
      data.note,
    );
    return Response.json({ id: result.id, stage: result.stage });
  } catch (error) {
    return failure(error);
  }
}
