"use client";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Layers,
  Rocket,
  X,
} from "lucide-react";
import type { Mission, Lang } from "../types/bydt";
export function MissionPanel({
  mission,
  assignmentId,
  lang,
  onComplete,
  completed,
  onViewPassport,
}: {
  mission: Mission;
  assignmentId: string;
  lang: Lang;
  onComplete: (reflection: string) => Promise<void>;
  completed: boolean;
  onViewPassport: () => void;
}) {
  const trigger = useRef<HTMLButtonElement | null>(null);
  const es = lang === "es";
  const [step, setStep] = useState(-1);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const [reflection, setReflection] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!modal) return;
    const previous = trigger.current;
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(false);
      if (e.key === "Tab" && dialog) {
        const items = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            "button:not(:disabled),textarea,input,a[href]",
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    const tick = () => {
      const raw = localStorage.getItem(`bydt-timer:${assignmentId}`);
      if (raw)
        setRemaining(Math.max(0, Math.ceil((Number(raw) - Date.now()) / 1000)));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [assignmentId]);
  function begin() {
    if (!localStorage.getItem(`bydt-timer:${assignmentId}`)) {
      localStorage.setItem(
        `bydt-timer:${assignmentId}`,
        String(Date.now() + mission.durationMinutes * 60000),
      );
      setRemaining(mission.durationMinutes * 60);
    }
    setStep(0);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onComplete(reflection);
      setModal(false);
    } catch {
      setError(
        es
          ? "No se guardó. Intenta de nuevo."
          : "Couldn’t save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className={`launchpad ${completed ? "mission-saved" : ""}`}
      id="offline-mission"
      tabIndex={-1}
      aria-labelledby="offline-mission-title"
    >
      <div className="section-label">
        <Rocket size={22} />
        <h2 id="offline-mission-title">
          {es ? "Fuera de la pantalla" : "Offline Launchpad"}
        </h2>
      </div>
      <div className="mission-summary">
        <div className="mission-symbol">
          <Layers size={37} />
        </div>
        <div>
          <small>
            {es ? "Tu próxima pequeña prueba" : "Your next little try"}
          </small>
          <h3>{mission.title}</h3>
          {!completed ? (
            <span className="muted">
              <Clock size={13} />{" "}
              {remaining !== null
                ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                : `${mission.durationMinutes} min`}{" "}
              · {es ? "Sin prisa" : "No rush"}
            </span>
          ) : null}
        </div>
      </div>
      {completed ? (
        <div className="mission-receipt">
          <p className="saved">
            <Check size={17} aria-hidden="true" />
            {es
              ? "Tu prueba está en tu pasaporte."
              : "Your build is in your passport."}
          </p>
          <button className="secondary wide" onClick={onViewPassport}>
            {es ? "Ver prueba guardada" : "View saved build"}
            <ArrowRight size={16} />
          </button>
        </div>
      ) : step < 0 ? (
        <>
          <div className="materials">
            {mission.materials.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <button className="orange wide" onClick={begin}>
            {es ? "¡Vamos a construir!" : "Let’s build!"}
            <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div className="step">
          <span>
            {es ? "Paso" : "Step"} {step + 1} / {mission.steps.length}
          </span>
          <p>{mission.steps[step]}</p>
          <div className="step-controls">
            <button
              className="icon-button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              aria-label={es ? "Paso anterior" : "Previous step"}
            >
              <ArrowLeft size={18} />
            </button>
            {step < mission.steps.length - 1 ? (
              <button className="orange" onClick={() => setStep((s) => s + 1)}>
                {es ? "Siguiente" : "Next"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="orange"
                onClick={(e) => {
                  trigger.current = e.currentTarget;
                  setModal(true);
                }}
                disabled={completed}
              >
                {completed ? <Check size={17} /> : null}
                {completed
                  ? es
                    ? "Guardado"
                    : "Build logged"
                  : es
                    ? "Cuenta qué pasó"
                    : "Log my build"}
              </button>
            )}
          </div>
        </div>
      )}
      {!completed ? (
        <details className="supervision">
          <summary>{es ? "Ayuda para construir" : "Build helpers"}</summary>
          <p>{mission.supervision}</p>
          <p>
            {es
              ? "Puedes cerrar esta pantalla mientras construyes."
              : "You can close this screen while you build."}
          </p>
        </details>
      ) : null}
      {modal ? (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reflection-title"
          >
            <button
              className="close icon-button"
              onClick={() => setModal(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="mission-symbol">
              <StarIcon />
            </div>
            <h2 id="reflection-title">
              {es ? "¡Una prueba más!" : "A little try. A real discovery."}
            </h2>
            <form onSubmit={submit}>
              <label htmlFor="reflection">
                {mission.masteryReflectionPrompt}
              </label>
              <textarea
                autoFocus
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                maxLength={2000}
                required
                placeholder={es ? "El papel doblado…" : "The folded paper…"}
              />
              <p className="muted">
                {es
                  ? "Una frase basta. Sin nombres ni datos personales."
                  : "One sentence is enough. No names or personal details."}
              </p>
              {error ? <p role="alert">{error}</p> : null}
              <button className="primary wide" disabled={busy}>
                {busy
                  ? es
                    ? "Guardando…"
                    : "Saving…"
                  : es
                    ? "Guardar en mi pasaporte"
                    : "Save to my passport"}
                <Check size={17} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
function StarIcon() {
  return <Check size={30} />;
}
