import type { Bundle, Lang, Mission } from "../../types/bydt";
export function missionFor(bundle: Bundle, lang: Lang): Mission {
  const es = lang === "es";
  const helping = bundle.occupation.socCode === "25-2021.00";
  const design = bundle.occupation.socCode === "27-1021.00";
  const linkedIds: Record<string, string> = {
    "17-2051.00": "4.A.1.b.2.c.4",
    "27-1021.00": "4.A.3.a.2.aj.1",
    "25-2021.00": "4.A.4.b.3.b.6",
    "17-2141.00": "4.A.3.b.2.d.1",
  };
  const linkedDwa = bundle.dwas.find(
    (d) => d.id === linkedIds[bundle.occupation.socCode],
  );
  if (!linkedDwa) throw new Error("No curated mission mapping available yet");
  const title = helping
    ? es
      ? "Inventa un juego en equipo"
      : "Invent a teamwork game"
    : design
      ? es
        ? "Diseña un organizador"
        : "Design a desk organizer"
      : es
        ? "Construye un puente de papel"
        : "Build a paper bridge";
  return {
    missionId: crypto.randomUUID(),
    linkedSocCode: bundle.occupation.socCode,
    linkedDwa,
    title,
    materials: es
      ? ["Papel", "Cinta adhesiva", "Dos libros"]
      : ["Paper", "Tape", "Two books"],
    durationMinutes: 20,
    steps: helping
      ? es
        ? [
            "Dibuja tres tarjetas con figuras.",
            "Inventa una regla para ordenarlas.",
            "Enseña el juego a otra persona.",
            "Pregunta qué cambiaría.",
          ]
        : [
            "Draw three shape cards.",
            "Invent a rule to sort them.",
            "Teach your game to someone.",
            "Ask what they would change.",
          ]
      : design
        ? es
          ? [
              "Dobla papel para hacer una caja.",
              "Pega los lados con cinta.",
              "Prueba con un lápiz.",
              "Cambia una cosa para mejorarla.",
            ]
          : [
              "Fold paper into a small tray.",
              "Tape the sides together.",
              "Test it with a pencil.",
              "Change one thing to improve it.",
            ]
        : es
          ? [
              "Separa dos libros un poco.",
              "Coloca papel como puente.",
              "Prueba con otro papel doblado.",
              "Compara cuál se sostiene mejor.",
            ]
          : [
              "Place two books a hand-width apart.",
              "Lay paper across the gap.",
              "Try again with folded paper.",
              "Compare which holds its shape.",
            ],
    masteryReflectionPrompt: es
      ? "¿Qué cambiaste? ¿Qué pasó?"
      : "What did you change? What happened?",
    supervision: es
      ? "Usa libros ligeros. Pide ayuda si la necesitas."
      : "Use light books. Ask a grown-up if you need help.",
  };
}

export function localizeMission(mission: Mission, language: Lang): Mission {
  return {
    ...missionFor(
      {
        occupation: {
          socCode: mission.linkedSocCode,
          title: "",
          description: "",
          brightOutlook: false,
          sourceMode: "fixture",
          sourceVersion: "31.0",
          language,
        },
        dwas: [mission.linkedDwa],
        elements: [],
      },
      language,
    ),
    missionId: mission.missionId,
  };
}
