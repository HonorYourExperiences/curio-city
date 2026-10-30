"use client";
import { Star } from "lucide-react";
import { WorkshopMark } from "./workshop-mark";
import type { Card, Band, Lang } from "../types/bydt";

export function CapeCard({
  card,
  band,
  lang,
  index = 0,
}: {
  card: Card;
  band: Band;
  lang: Lang;
  index?: number;
}) {
  const kind =
    card.onetElementId === "1.A.1.f.2"
      ? "build"
      : ["1.A.1.b.2", "1.A.1.b.1", "1.D.1.a", "1.D.1.c"].includes(
            card.onetElementId,
          )
        ? "idea"
        : card.onetElementId === "1.A.1.b.3"
          ? "spotter"
          : ["1.D.2.d", "2.B.1.a", "2.B.1.b"].includes(card.onetElementId)
            ? "care"
            : "skill";
  return (
    <article
      className={`cape cape-${index % 3}`}
      aria-label={lang === "es" ? card.es.title : card.capeAbilityTitle}
    >
      <div className="cape-art">
        <WorkshopMark kind={kind} />
        <Star className="tiny-star" size={16} />
      </div>
      <div className="cape-copy">
        <h3>{lang === "es" ? card.es.title : card.capeAbilityTitle}</h3>
        <p>
          {lang === "es"
            ? band === "Explorer_6_8"
              ? card.es.explorer
              : card.es.builder
            : band === "Explorer_6_8"
              ? card.explorerMeaning
              : card.builderMeaning}
        </p>
        <details>
          <summary>{lang === "es" ? "Más" : "More"}</summary>
          <p>
            {card.rawOnetName}
            <br />
            {card.onetElementId}
          </p>
        </details>
      </div>
    </article>
  );
}
