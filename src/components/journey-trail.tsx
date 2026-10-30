import { Check, Sparkles, Hammer, MessageCircle } from "lucide-react";
import type { Lang } from "../types/bydt";
export function JourneyTrail({
  stage,
  lang,
}: {
  stage: 0 | 1 | 2;
  lang: Lang;
}) {
  const labels =
    lang === "es"
      ? ["Imagina", "Prueba", "Cuenta"]
      : ["Wonder", "Try", "Reflect"];
  const icons = [Sparkles, Hammer, MessageCircle];
  return (
    <ol
      className="journey-trail"
      aria-label={lang === "es" ? "Tu recorrido" : "Your journey"}
    >
      {labels.map((label, i) => {
        const Icon = stage > i ? Check : icons[i];
        return (
          <li
            key={label}
            aria-current={stage === i ? "step" : undefined}
            data-complete={stage > i}
          >
            <span className="trail-icon">
              <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
