export function scrubPII(input: string): {
  cleanText: string;
  redactions: string[];
} {
  let cleanText = input;
  const redactions: string[] = [];
  const rules: [string, RegExp][] = [
    ["email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
    ["phone", /(?<!\w)(?:\+?\d[\d ().-]{7,}\d)(?!\w)/g],
    ["handle", /@[\w.]+/g],
    [
      "name",
      /\b(?:my name is|i am named|i'm called|me llamo|mi nombre es)\s+[\p{L}]+(?:[ -][\p{L}]+){0,2}/giu,
    ],
    [
      "name",
      /\b(?:I am|I'm|Soy)\s+[A-ZÁÉÍÓÚÑ][\p{L}]+(?:[ -][A-ZÁÉÍÓÚÑ][\p{L}]+){0,2}/gu,
    ],
    [
      "name",
      /\b(?:my friend|my teacher|mi amigo|mi amiga|mi profesor)\s+[A-ZÁÉÍÓÚÑ][\p{L}]+(?:[ -][A-ZÁÉÍÓÚÑ][\p{L}]+){0,2}/gu,
    ],
    [
      "school",
      /\b(?:my school is|i go to|mi escuela es|voy a)\s+[^.!?\n,]{1,80}/giu,
    ],
    [
      "school",
      /\b(?:[A-ZÁÉÍÓÚÑ][\p{L}]+\s+){1,3}(?:School|Elementary|Academy|High School)\b/gu,
    ],
    [
      "address",
      /\b\d{1,6}\s+[\p{L}0-9 .-]{1,50}\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|calle|avenida)\b/giu,
    ],
    ["address", /\b(?:calle|avenida)\s+[\p{L}0-9 .-]{1,50}\s\d{1,6}\b/giu],
  ];
  for (const [kind, pattern] of rules)
    cleanText = cleanText.replace(pattern, () => {
      if (!redactions.includes(kind)) redactions.push(kind);
      return `[${kind.toUpperCase()}]`;
    });
  return { cleanText, redactions };
}
export async function discardAudio(buffer: Buffer) {
  try {
    return {
      disabled: true,
      message:
        "Voice transcription is disabled in this synthetic-data demonstration.",
    };
  } finally {
    buffer.fill(0);
  }
}
