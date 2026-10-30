"use client";
import Link from "next/link";
import {
  Check,
  ClipboardList,
  Download,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import type { Entry, Chat, Lang } from "../types/bydt";
import { seedDictionary } from "../lib/bydt/dictionary";
export function Stakeholder({
  view,
  entries,
  active,
  profileId,
  lang,
  onReview,
  onDelete,
}: {
  view: string;
  entries: Entry[];
  active: Chat | null;
  profileId: string;
  lang: Lang;
  onReview: (assignmentId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const es = lang === "es";
  const completed = entries.filter((e) => e.stage === "self_reported");
  const capabilities = new Set(
    entries.flatMap((e) => e.unlockedCapeAbilityIds),
  );
  const clusters = [...new Set(completed.map((e) => e.perkinsCluster))];
  if (view === "parent")
    return (
      <div className="adult-view">
        <div className="adult-heading">
          <h1>
            {es
              ? "Haz espacio para una pequeña prueba."
              : "A little prep. A world of possibility."}
          </h1>
          <p>
            {es
              ? "Acompaña sus ideas con materiales sencillos."
              : "Follow their curiosity. Make a little room for making."}
          </p>
        </div>
        <div className="adult-grid">
          <section className="paper">
            <h2>{es ? "Cómo acompañar" : "Make room for discovery"}</h2>
            {(es
              ? [
                  "Prepara un espacio para construir.",
                  "Deja que elija y pruebe.",
                  "Pregunta: ¿Qué cambiarías?",
                  "Celebra el esfuerzo, no la perfección.",
                ]
              : [
                  "Set out a few simple materials.",
                  "Let them choose, try, and change.",
                  "Ask: “What would you try next?”",
                  "Notice effort, not perfect results.",
                ]
            ).map((x, i) => (
              <div className="prep-row" key={x}>
                <span>{i + 1}</span>
                <p>{x}</p>
              </div>
            ))}
            <h3>{es ? "Lista de preparación" : "This week’s prep list"}</h3>
            <div className="materials">
              {(
                active?.launchpadMission.materials ??
                (es
                  ? ["Papel", "Cinta adhesiva", "Dos libros"]
                  : ["Paper", "Tape", "Two books"])
              ).map((m) => (
                <span key={m}>
                  <Check size={14} />
                  {m}
                </span>
              ))}
            </div>
          </section>
          <section className="paper">
            <h2>{es ? "Formas de explorar" : "Ways they’re exploring"}</h2>
            <Radar entries={entries} es={es} />
            <p className="muted">
              {es
                ? "Resumen de actividades registradas; no mide aptitud ni personalidad."
                : "Recorded activity signals, not an aptitude or personality assessment."}
            </p>
            <div className="mini-stats">
              <div>
                <strong>{capabilities.size}</strong>
                <span>{es ? "Descubiertas" : "Discovered"}</span>
              </div>
              <div>
                <strong>{completed.length}</strong>
                <span>{es ? "Pruebas realizadas" : "Builds reported"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  return (
    <div className="adult-view">
      <div className="adult-heading">
        <div>
          <h1>
            {es
              ? "Pequeñas pruebas. Evidencia que crece."
              : "Little tries. Growing evidence."}
          </h1>
          <p>
            {es
              ? "Pasaporte de capacidades · Perfil sintético"
              : "Capability passport · Synthetic profile"}{" "}
            <strong>
              {profileId === "demo-explorer" ? "Explorer" : "Builder"}
            </strong>
          </p>
        </div>
        <a
          className="secondary"
          href={`/api/passport?profileId=${profileId}&export=1`}
        >
          <Download size={16} />
          {es ? "Exportar" : "Export JSON"}
        </a>
      </div>
      <div className="passport-summary">
        <div>
          <strong>{capabilities.size}</strong>
          <span>
            {es ? "Capacidades descubiertas" : "Capabilities discovered"}
          </span>
        </div>
        <div>
          <strong>{completed.length}</strong>
          <span>{es ? "Pruebas registradas" : "Self-reported builds"}</span>
        </div>
        <div>
          <strong>
            {entries.filter((e) => e.stage === "adult_reviewed").length}
          </strong>
          <span>{es ? "Revisiones adultas" : "Adult reviews"}</span>
        </div>
      </div>
      <section className="paper">
        <h2>{es ? "Tu recorrido" : "The evidence trail"}</h2>
        <p className="muted">
          {es
            ? "Descubrir → Probar → Revisar. Cada etapa se registra por separado."
            : "Discover → Try → Review. Each stage is recorded separately."}
        </p>
        {!entries.length ? (
          <div className="empty-state">
            <ClipboardList size={38} />
            <h3>
              {es
                ? "Tu primera prueba empieza aquí."
                : "Your first little try starts here."}
            </h3>
            <p>
              {es
                ? "Vuelve al taller y elige una idea."
                : "Head to the workshop and choose an idea."}
            </p>
            <Link href="/" className="primary">
              {es ? "Ir al taller" : "Go to workshop"}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="timeline">
            {entries
              .slice()
              .reverse()
              .map((e) => (
                <article key={e.id}>
                  <div className={`timeline-dot ${e.stage}`} />
                  <div>
                    <small>
                      {new Date(e.timestamp).toLocaleDateString(
                        es ? "es" : "en",
                        { month: "short", day: "numeric" },
                      )}
                    </small>
                    <h3>
                      {e.stage === "discovered"
                        ? es
                          ? "Capacidades descubiertas"
                          : "Capabilities discovered"
                        : e.stage === "self_reported"
                          ? es
                            ? "Prueba registrada"
                            : "Build self-reported"
                          : es
                            ? "Revisión adulta registrada"
                            : "Adult review recorded"}
                    </h3>
                    <p>
                      {e.masteryReflection ??
                        e.unlockedCapeAbilityIds
                          .map((id) => {
                            const c = seedDictionary.find((c) => c.id === id);
                            return es ? c?.es.title : c?.capeAbilityTitle;
                          })
                          .join(" · ")}
                    </p>
                    <details>
                      <summary>
                        {es ? "Fuentes y evidencia" : "Source & evidence"}
                      </summary>
                      <p>
                        {e.onetElementIds.join(" · ")}
                        <br />
                        {e.dwaId} · {e.sourceVersion} · {e.dictionaryVersion}
                        <br />
                        {e.perkinsCluster} · {e.clusterMappingVersion}
                        <br />
                        {e.sourceMode === "fixture"
                          ? "Illustrative fixture mapping"
                          : "Live source"}
                      </p>
                    </details>
                  </div>
                  {e.stage === "self_reported" &&
                  !entries.some(
                    (x) =>
                      x.assignmentId === e.assignmentId &&
                      x.stage === "adult_reviewed",
                  ) ? (
                    <button
                      className="secondary"
                      onClick={() => onReview(e.assignmentId)}
                    >
                      {es ? "Revisar (demo)" : "Review (demo)"}
                    </button>
                  ) : null}
                </article>
              ))}
          </div>
        )}
      </section>
      <div className="adult-grid bottom-grid">
        <section className="paper">
          <h2>{es ? "Áreas exploradas" : "Career cluster distribution"}</h2>
          {clusters.length ? (
            clusters.map((c) => (
              <div className="cluster" key={c}>
                <span>{c}</span>
                <strong>
                  {completed.filter((e) => e.perkinsCluster === c).length}
                </strong>
              </div>
            ))
          ) : (
            <p className="muted">
              {es
                ? "Se completa al registrar una prueba."
                : "Complete a build to start this view."}
            </p>
          )}
          <p className="muted">
            {es
              ? "Mapeo ilustrativo de 16 grupos; no es un informe oficial."
              : "Illustrative legacy 16-cluster mapping; ACP/Perkins planning export, not an official report."}
          </p>
        </section>
        <section className="paper">
          <h2>{es ? "Apoyo del orientador" : "Counselor planning"}</h2>
          <p>
            {es
              ? "Ejemplos de apoyo, asignados manualmente."
              : "Example support groups, assigned manually."}
          </p>
          <div className="cohort">
            <span>Tier 1</span>
            <p>
              {es ? "Exploración para todos" : "Universal curiosity workshop"}
            </p>
          </div>
          <div className="cohort">
            <span>Tier 2</span>
            <p>
              {es
                ? "Grupo pequeño (ejemplo)"
                : "Small-group build support (example)"}
            </p>
          </div>
          <div className="cohort">
            <span>Tier 3</span>
            <p>
              {es
                ? "Apoyo individual (ejemplo)"
                : "Individual support (example)"}
            </p>
          </div>
          <p className="muted">
            {es
              ? "No se infieren necesidades ni niveles del estudiante."
              : "No student needs or counseling tiers are inferred."}
          </p>
        </section>
      </div>
      <details className="delete-area">
        <summary>
          {es ? "Administrar datos de demostración" : "Manage demo data"}
        </summary>
        <p>
          {es
            ? "Elimina el perfil sintético y todas sus pruebas."
            : "Delete this synthetic profile and all linked evidence."}
        </p>
        <button className="danger secondary" onClick={onDelete}>
          <Trash2 size={15} />
          {es ? "Eliminar este perfil" : "Delete this demo profile"}
        </button>
      </details>
    </div>
  );
}
function Radar({ entries, es }: { entries: Entry[]; es: boolean }) {
  const ids = ["cape-10", "cape-9", "cape-15", "cape-11"];
  const values = ids.map((id) =>
    Math.min(
      5,
      entries.filter(
        (e) =>
          e.stage === "discovered" && e.unlockedCapeAbilityIds.includes(id),
      ).length,
    ),
  );
  const axes = [
    [150, 40],
    [260, 140],
    [150, 240],
    [40, 140],
  ];
  const points = axes
    .map(
      ([x, y], i) =>
        `${150 + ((x - 150) * values[i]) / 5},${140 + ((y - 140) * values[i]) / 5}`,
    )
    .join(" ");
  return (
    <svg
      className="radar"
      viewBox="0 0 300 280"
      role="img"
      aria-label="Activity radar: initiative, persistence, intellectual curiosity, cooperation"
    >
      <g fill="none" stroke="#ded7ef">
        {[1, 0.75, 0.5, 0.25].map((scale) => (
          <polygon
            key={scale}
            points={axes
              .map(
                ([x, y]) =>
                  `${150 + (x - 150) * scale},${140 + (y - 140) * scale}`,
              )
              .join(" ")}
          />
        ))}
        {axes.map(([x, y]) => (
          <line key={x + "," + y} x1="150" y1="140" x2={x} y2={y} />
        ))}
      </g>
      <polygon
        points={points}
        fill="#8866dd55"
        stroke="#7950c8"
        strokeWidth="2"
      />
      {values.every((v) => v === 0) ? (
        <circle cx="150" cy="140" r="4" fill="#7950c8" />
      ) : null}
      <g fill="#50436b" fontSize="11" textAnchor="middle">
        <text x="150" y="23">
          {es ? "Iniciativa" : "Initiative"}
        </text>
        <text x="268" y="158">
          {es ? "Perseverancia" : "Perseverance"}
        </text>
        <text x="150" y="262">
          {es ? "Curiosidad" : "Intellectual curiosity"}
        </text>
        <text x="39" y="158">
          {es ? "Cooperación" : "Cooperation"}
        </text>
      </g>
    </svg>
  );
}
