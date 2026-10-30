import { discardAudio } from "../../../lib/safety/coppa-guard";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 1048576)
    return Response.json({ error: "Audio too large" }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ disabled: true }, { status: 501 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let audio: Buffer | undefined;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
      if (size > 1048576) {
        await reader.cancel();
        return Response.json({ error: "Audio too large" }, { status: 413 });
      }
    }
    audio = Buffer.concat(chunks);
    return Response.json(await discardAudio(audio), { status: 501 });
  } finally {
    audio?.fill(0);
    chunks.forEach((c) => c.fill(0));
    reader.releaseLock();
  }
}
