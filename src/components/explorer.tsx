"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search, Sun, Compass } from "lucide-react";
import { Brand, Attribution } from "./brand";
import type { Lang, Occupation } from "../types/bydt";
export function Explorer() {
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Occupation[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const es = lang === "es";
  async function search(q: string, l: Lang) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/explore?q=${encodeURIComponent(q)}&lang=${l}`,
      );
      if (!response.ok) throw new Error();
      const d = await response.json();
      setResults(d.occupations);
      setNotice(d.notice);
    } catch {
      setError(
        es
          ? "No se pudo buscar. Intenta otra vez."
          : "Search could not load. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    search("", lang); /* Search is submitted explicitly after typing. */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  return (
    <>
      <header className="topbar">
        <Brand />
        <Link className="back-link" href="/">
          <ArrowLeft size={16} />
          {es ? "Volver al taller" : "Back to workshop"}
        </Link>
        <div className="language">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              aria-pressed={lang === l}
              className={lang === l ? "selected" : ""}
              onClick={() => {
                setLang(l);
                document.documentElement.lang = l;
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <main className="explorer-page" lang={lang}>
        <div className="explorer-intro">
          <Compass size={40} />
          <h1>
            {es ? "Un mundo de posibilidades." : "A world of possibilities."}
          </h1>
          <p>
            {es
              ? "Explora lo que hacen las personas. Sin registro."
              : "Explore what people do. Open to everyone. No sign-up."}
          </p>
          <form
            className="explorer-search"
            onSubmit={(e) => {
              e.preventDefault();
              search(query, lang);
            }}
          >
            <Search size={22} />
            <label className="sr-only" htmlFor="search">
              {es ? "Buscar carreras" : "Search careers"}
            </label>
            <input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={160}
              placeholder={
                es
                  ? "Prueba “puente”, “diseño” o “ayudar”"
                  : "Try “bridge”, “design”, or “help”"
              }
            />
            <button className="primary" disabled={busy}>
              {es ? "Buscar" : "Search"}
            </button>
          </form>
        </div>
        <div className="source-notice">
          <span className="status-dot" />
          {notice || "Loading occupational sources…"}
          <details>
            <summary>{es ? "Acerca de los datos" : "About this data"}</summary>
            <p>
              {es
                ? "Los ejemplos no representan una búsqueda completa. Los resúmenes en español de la demo son adaptaciones de BYDT. No hay indicadores Bright Outlook verificados en modo demo."
                : "Fixtures are a small illustrative set. Spanish fixture summaries are BYDT adaptations. Bright Outlook status is unverified in demo mode."}
            </p>
          </details>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <div aria-live="polite">
          {busy ? (
            <p className="loading">
              {es ? "Buscando posibilidades…" : "Finding possibilities…"}
            </p>
          ) : !results.length ? (
            <div className="paper empty-state">
              <Search size={34} />
              <h2>{es ? "Prueba otra palabra." : "Try another spark."}</h2>
              <p>
                {es
                  ? "Esta demo incluye puentes, diseño, enseñanza y máquinas."
                  : "This demo includes bridges, design, teaching, and machines."}
              </p>
            </div>
          ) : (
            <div className="occupation-list">
              {results.map((o) => (
                <article className="occupation paper" key={o.socCode}>
                  <div className="occupation-number">
                    {o.socCode.split("-")[0]}
                  </div>
                  <div className="occupation-content">
                    <div className="occupation-meta">
                      <span>{o.socCode}</span>
                      <span>
                        {o.sourceMode === "fixture"
                          ? es
                            ? "Ejemplo"
                            : "Fixture"
                          : o.sourceVersion}
                      </span>
                      {o.brightOutlook ? (
                        <span className="bright">
                          <Sun size={14} />
                          Bright Outlook
                        </span>
                      ) : null}
                    </div>
                    <h2>{o.title}</h2>
                    <p>{o.description}</p>
                    <div className="occupation-actions">
                      <Link className="secondary" href={`/?soc=${o.socCode}`}>
                        {es ? "Abrir en Curio City" : "Launch in Curio City"}
                        <ArrowUpRight size={16} />
                      </Link>
                      <a
                        href={`https://${es ? "www.miproximopaso.org" : "www.mynextmove.org"}/profile/summary/${o.socCode}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {es ? "Ver fuente oficial" : "Official source"}
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Attribution />
    </>
  );
}
