"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Shapes,
  Star,
  MicOff,
  Check,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { Band, Lang, Chat, Entry } from "../types/bydt";
import { Brand, Attribution } from "./brand";
import { WorkshopMark } from "./workshop-mark";
import { JourneyTrail } from "./journey-trail";
import { CapeCard } from "./cape-card";
import { MissionPanel } from "./mission-panel";
import { Stakeholder } from "./stakeholder";
import { localizeMission } from "../lib/bydt/missions";
import { deterministicJourney } from "../lib/bydt/journey";
import { seedDictionary } from "../lib/bydt/dictionary";
async function api<T>(
  url: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const r = await fetch(
    url,
    body
      ? {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  if (!r.ok) throw new Error("Request failed");
  return r.json();
}
export function Workshop() {
  const [band, setBand] = useState<Band>("Explorer_6_8");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState("kid");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pillar, setPillar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socCode, setSocCode] = useState<string | undefined>();
  const es = lang === "es";
  const profileId = band === "Explorer_6_8" ? "demo-explorer" : "demo-builder";
  useEffect(() => {
    const soc = new URLSearchParams(location.search).get("soc");
    if (soc && /^\d{2}-\d{4}\.\d{2}$/.test(soc)) {
      setSocCode(soc);
      setMessage("I want to try an activity from this career.");
    }
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api<{ entries: Entry[]; activeAssignment: Chat | null }>(
      `/api/passport?profileId=${profileId}`,
    )
      .then((data) => {
        if (active) {
          setEntries(data.entries);
          setChat(data.activeAssignment);
          setPillar(0);
        }
      })
      .catch(() => {
        if (active) setError("Could not load your passport. Please refresh.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profileId]);
  async function refresh() {
    const d = await api<{ entries: Entry[]; activeAssignment: Chat | null }>(
      `/api/passport?profileId=${profileId}`,
    );
    setEntries(d.entries);
    setChat(d.activeAssignment);
  }
  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await api<Chat>("/api/chat", {
        message: text,
        gradeBand: band,
        language: lang,
        profileId,
        socCode,
      });
      setChat(response);
      setPillar(0);
      setMessage("");
      setSocCode(undefined);
      await refresh();
    } catch {
      setError(
        es
          ? "No se pudo crear la prueba. Intenta otra vez."
          : "Couldn’t find a little try. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function complete(reflection: string) {
    if (chat) {
      await api("/api/missions/complete", {
        profileId,
        assignmentId: chat.assignmentId,
        reflection,
      });
      await refresh();
    }
  }
  async function review(assignmentId: string) {
    try {
      await api("/api/review", {
        profileId,
        assignmentId,
        note: es
          ? "Revisión de demostración de la reflexión."
          : "Demonstration adult review of the reflection.",
      });
      await refresh();
    } catch {
      setError(es ? "No se pudo guardar." : "Could not save the review.");
    }
  }
  async function remove() {
    if (
      !window.confirm(
        es
          ? "¿Eliminar todos los datos de este perfil de demostración?"
          : "Delete all evidence for this synthetic profile?",
      )
    )
      return;
    try {
      const r = await fetch(`/api/passport?profileId=${profileId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error();
      entries.forEach((e) =>
        localStorage.removeItem(`bydt-timer:${e.assignmentId}`),
      );
      await refresh();
    } catch {
      setError(es ? "No se pudo eliminar." : "Could not delete the profile.");
    }
  }
  const completedEntry = chat
    ? entries.find(
        (e) =>
          e.assignmentId === chat.assignmentId && e.stage === "self_reported",
      )
    : undefined;
  function focusMission() {
    const target = document.getElementById("offline-mission");
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }
  const preview = [seedDictionary[0], seedDictionary[1], seedDictionary[10]];
  const cards = chat?.unlockedCards ?? preview;
  const journey = chat
    ? chat.language === lang
      ? chat.journeyResponse
      : deterministicJourney(
          chat.launchpadMission.linkedSocCode,
          entries.find((e) => e.assignmentId === chat.assignmentId)
            ?.scrubbedInterest ?? "",
          lang,
          band,
        )
    : null;
  const pillars = [
    "reflective",
    "narrative",
    "persuasive",
    "instructional",
  ] as const;
  const pillarLabels = es
    ? ["Tu idea", "Mira alrededor", "Puedes practicar", "A construir"]
    : [
        "Your idea",
        "Real-world makers",
        "A little encouragement",
        "Your little try",
      ];
  return (
    <>
      <header className="topbar">
        <Brand />
        <nav aria-label="Main navigation">
          {[
            ["kid", es ? "Taller" : "Workshop"],
            ["parent", es ? "Para adultos" : "For grown-ups"],
            ["educator", es ? "Pasaporte" : "Skill passport"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <Link href="/explore" className="explore-link">
            {es ? "Explorar carreras" : "Explore careers"}
            <ArrowUpRight size={16} />
          </Link>
          <label className="band-label">
            <span className="sr-only">Age band</span>
            <select
              aria-label="Age band"
              value={band}
              onChange={(e) => setBand(e.target.value as Band)}
              disabled={busy}
            >
              <option value="Explorer_6_8">
                {es ? "Explorador: 6–8" : "Explorer: 6–8"}
              </option>
              <option value="Builder_9_13">
                {es ? "Constructor: 9–13" : "Builder: 9–13"}
              </option>
            </select>
          </label>
          <div className="language" aria-label="Language">
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  document.documentElement.lang = l;
                }}
                aria-pressed={lang === l}
                className={lang === l ? "selected" : ""}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main lang={lang}>
        <div className="demo-strip">
          <span className="status-dot" />
          {es
            ? "Demo · Solo perfiles ficticios"
            : "Demo · Synthetic profiles only"}
          <span className="demo-mode">
            {chat?.sourceMode === "live"
              ? es
                ? "O*NET en vivo"
                : "Live O*NET"
              : es
                ? "Datos de ejemplo"
                : "Sample occupational data"}
          </span>
        </div>
        {error ? (
          <div className="error" role="alert">
            {error}
          </div>
        ) : null}
        {view === "kid" ? (
          <>
            <section className={`intro ${chat ? "intro--active" : ""}`}>
              <h1 className={chat ? "sr-only" : undefined}>
                {es ? (
                  <>
                    Grandes ideas.
                    <br />
                    <span className="handwritten-accent">
                      Pequeños intentos.
                    </span>
                  </>
                ) : (
                  <>
                    Big ideas.
                    <br />
                    <span className="handwritten-accent">Little tries.</span>
                  </>
                )}
              </h1>
              <JourneyTrail
                stage={
                  chat
                    ? entries.some(
                        (e) =>
                          e.assignmentId === chat.assignmentId &&
                          e.stage === "self_reported",
                      )
                      ? 2
                      : 1
                    : 0
                }
                lang={lang}
              />
            </section>
            <div className="workshop-grid">
              <section
                className="paper conversation"
                aria-busy={busy || loading}
              >
                {!chat ? (
                  <div className="greeting">
                    <span className="wave" aria-hidden="true">
                      ✦
                    </span>
                    {es ? "¡Hola, explorador!" : "Hey, curious you."}
                  </div>
                ) : null}
                <h2>
                  {completedEntry
                    ? es
                      ? "Tu pequeña prueba cuenta."
                      : "Your little try counts."
                    : chat
                      ? es
                        ? "Sigue tu chispa."
                        : "Follow your spark."
                      : es
                        ? "¿Qué te da curiosidad?"
                        : "What are you curious about?"}
                </h2>
                {!chat ? (
                  <p className="subtext">
                    {es
                      ? "Elige una idea o cuenta la tuya."
                      : "Pick a spark. Or bring your own."}
                  </p>
                ) : null}
                {!chat ? (
                  <div className="prompt-grid">
                    {[
                      {
                        kind: "build" as const,
                        title: es ? "Construir cosas" : "Building things",
                        desc: es
                          ? "Crear. Probar. Cambiar."
                          : "Make. Test. Tinker.",
                        text: es
                          ? "Quiero construir un puente"
                          : "I want to build a bridge",
                      },
                      {
                        kind: "mechanics" as const,
                        title: es ? "Cómo funcionan" : "How things work",
                        desc: es ? "Abrir una nueva idea." : "Find the “why.”",
                        text: es
                          ? "Cómo funcionan las máquinas"
                          : "How do machines work?",
                      },
                      {
                        kind: "care" as const,
                        title: es ? "Ayudar a otros" : "Helping people",
                        desc: es ? "Hacer algo bueno." : "Make someone’s day.",
                        text: es
                          ? "Quiero ayudar a un amigo"
                          : "I want to help a friend",
                      },
                    ].map(({ kind, title, desc, text }, i) => (
                      <button
                        className={`prompt prompt-${i}`}
                        key={title}
                        onClick={() => send(text)}
                        disabled={busy || loading}
                      >
                        <WorkshopMark kind={kind} />
                        <strong>{title}</strong>
                        <span>{desc}</span>
                        <span className="round-arrow">
                          <ArrowRight size={19} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : completedEntry ? (
                  <div className="completed-story" role="status">
                    <span className="receipt-seal">
                      <Check size={30} aria-hidden="true" />
                    </span>
                    <p className="journey-sentence">
                      {es
                        ? "Tu reflexión está guardada. Puedes volver a ella."
                        : "Your reflection is saved. You can come back to it."}
                    </p>
                    <button
                      className="primary"
                      onClick={() => setView("educator")}
                    >
                      {es ? "Ver mi pasaporte" : "See my passport"}
                      <ArrowRight size={17} />
                    </button>
                    <button
                      className="start-over"
                      onClick={() => {
                        setChat(null);
                        setMessage("");
                      }}
                    >
                      <RotateCcw size={14} />
                      {es ? "Explorar otra idea" : "Explore another spark"}
                    </button>
                  </div>
                ) : (
                  <div className="journey" aria-live="polite">
                    <div className="journey-top">
                      <span className="pillar-label">
                        {pillarLabels[pillar]}
                      </span>
                      <span>{pillar + 1} / 4</span>
                    </div>
                    <div className="journey-star">
                      <Star size={40} fill="currentColor" />
                    </div>
                    <p
                      className="journey-sentence"
                      key={`${chat.assignmentId}-${pillar}-${lang}`}
                    >
                      {journey?.[pillars[pillar]]}
                    </p>
                    <div className="journey-controls">
                      <div className="dots">
                        {pillars.map((p, i) => (
                          <button
                            key={p}
                            className={pillar === i ? "current" : ""}
                            aria-pressed={pillar === i}
                            onClick={() => setPillar(i)}
                            aria-label={pillarLabels[i]}
                          />
                        ))}
                      </div>
                      {pillar < 3 ? (
                        <button
                          className="soft-button"
                          onClick={() => setPillar((p) => p + 1)}
                        >
                          {es ? "Sigue" : "Keep going"}
                          <ChevronRight size={17} />
                        </button>
                      ) : (
                        <button
                          className="orange handoff-button"
                          onClick={focusMission}
                        >
                          {es ? "Probar sin pantalla" : "Try it offline"}
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                    <button
                      className="start-over"
                      onClick={() => {
                        setChat(null);
                        setMessage("");
                      }}
                    >
                      <RotateCcw size={13} />
                      {es ? "Explorar otra idea" : "Explore another spark"}
                    </button>
                  </div>
                )}
                {busy ? (
                  <p className="spark-status" role="status">
                    <span aria-hidden="true">✦</span>
                    {es ? "Buscando tu chispa…" : "Finding your spark…"}
                  </p>
                ) : null}
                <form
                  className="chat-input"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(message);
                  }}
                >
                  <Star size={19} fill="currentColor" />
                  <label className="sr-only" htmlFor="curiosity">
                    {es ? "Tu idea" : "Your curiosity"}
                  </label>
                  <input
                    id="curiosity"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={es ? "Tengo una idea…" : "I wonder…"}
                    maxLength={1500}
                    disabled={busy || loading}
                  />
                  <button
                    className="primary"
                    disabled={!message.trim() || busy || loading}
                    aria-label={es ? "Enviar idea" : "Send curiosity"}
                  >
                    {busy ? "…" : <ArrowRight size={22} />}
                  </button>
                </form>
                <div className="conversation-foot">
                  <span>
                    <MicOff size={13} />
                    {es ? "Solo texto en esta demo" : "Text only in this demo"}
                  </span>
                  <span>
                    {es
                      ? "Sin nombres ni datos personales."
                      : "Leave out names & personal details."}
                  </span>
                </div>
              </section>
              <aside
                className={`paper deck-panel ${chat ? "has-mission" : ""}`}
              >
                {chat ? (
                  <MissionPanel
                    key={chat.assignmentId}
                    mission={localizeMission(chat.launchpadMission, lang)}
                    assignmentId={chat.assignmentId}
                    lang={lang}
                    onComplete={complete}
                    completed={Boolean(completedEntry)}
                    onViewPassport={() => setView("educator")}
                  />
                ) : null}
                <div className="deck-heading">
                  <h2>
                    {es ? "Tus Cape-Abilities" : "Your Cape-Ability deck"}
                  </h2>
                  <span>
                    {chat
                      ? es
                        ? "Descubiertas"
                        : "Discovered"
                      : es
                        ? "Vista previa"
                        : "A peek at what’s possible"}
                  </span>
                </div>
                <div
                  className="deck"
                  role="region"
                  aria-label={
                    es ? "Tarjetas Cape-Ability" : "Cape-Ability cards"
                  }
                  tabIndex={0}
                >
                  {cards.map((card, i) => (
                    <CapeCard
                      key={`${card.id}-${lang}`}
                      card={card}
                      band={band}
                      lang={lang}
                      index={i}
                    />
                  ))}
                </div>
                {!chat ? (
                  <section className="launchpad preview-launch">
                    <div className="section-label">
                      <Star size={21} />
                      <h2>
                        {es ? "Tu próxima aventura" : "Offline Launchpad"}
                      </h2>
                    </div>
                    <div className="mission-summary">
                      <div className="mission-symbol">
                        <Shapes size={36} />
                      </div>
                      <div>
                        <small>
                          {es
                            ? "Menos pantalla. Más crear."
                            : "Less scrolling. More making."}
                        </small>
                        <h3>
                          {es
                            ? "Una idea se vuelve real."
                            : "An idea you can hold."}
                        </h3>
                        <p className="muted">
                          {es
                            ? "Elige una idea para encontrar tu prueba."
                            : "Pick a spark to find your first little build."}
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </aside>
            </div>
            {!completedEntry ? (
              <div className="bottom-note">
                <span className="small-star">✦</span>
                <span>
                  {es
                    ? "Descubrir es el comienzo. Probar es el siguiente paso."
                    : "Discovering is a start. Trying is where it grows."}
                </span>
                <button onClick={() => setView("educator")}>
                  {es ? "Ver mi pasaporte" : "See my passport"}
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <Stakeholder
            view={view}
            entries={entries}
            active={chat}
            profileId={profileId}
            lang={lang}
            onReview={review}
            onDelete={remove}
          />
        )}
      </main>
      <Attribution />
    </>
  );
}
