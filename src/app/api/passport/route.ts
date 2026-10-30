import { db } from "../../../lib/db";
import { getPassport } from "../../../lib/bydt/passport";
import { failure, profileSchema, sameOrigin } from "../../../lib/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = profileSchema.parse(url.searchParams.get("profileId"));
    const data = await getPassport(id);
    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store",
        ...(url.searchParams.has("export")
          ? {
              "Content-Disposition": `attachment; filename="${id}-passport.json"`,
            }
          : {}),
      },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const id = profileSchema.parse(
      new URL(request.url).searchParams.get("profileId"),
    );
    await db.profile.deleteMany({ where: { id } });
    return Response.json({ deleted: true });
  } catch (error) {
    return failure(error);
  }
}
