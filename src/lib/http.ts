import { z } from "zod";
export const profileSchema = z.enum(["demo-explorer", "demo-builder"]);
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 12000)
    throw new Error("Request too large");
  const text = await request.text();
  if (text.length > 12000) throw new Error("Request too large");
  return JSON.parse(text) as unknown;
}
export function failure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof z.ZodError
          ? "Please check the submitted fields."
          : "Could not complete this action. Check the profile and mission, then try again.",
    },
    { status: 400 },
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    origin &&
    new URL(origin).host !==
      (request.headers.get("host") ?? new URL(request.url).host)
  )
    throw new Error("Cross-origin write rejected");
}
