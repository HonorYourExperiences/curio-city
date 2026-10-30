import { onetClient } from "../../../lib/onet/client";
import { Language } from "../../../types/bydt";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lang = Language.parse(url.searchParams.get("lang") ?? "en");
    const occupations = await onetClient.searchOccupations(
      (url.searchParams.get("q") ?? "").slice(0, 160),
      lang,
    );
    return Response.json({ occupations, notice: onetClient.lastNotice });
  } catch {
    return Response.json(
      { error: "Search is unavailable. Please try again." },
      { status: 503 },
    );
  }
}
