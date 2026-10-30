import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Curio City by BYDT home">
      <strong>
        Curio City
        <Star fill="currentColor" size={21} />
      </strong>
      <span className="company-attribution">by BYDT</span>
    </Link>
  );
}
export function Attribution() {
  return (
    <footer>
      <div className="creative-signature">
        <Star size={15} fill="currentColor" aria-hidden="true" />
        <span>
          Made with <strong>Artistic Intelligence</strong>{" "}
          <span className="ai-mark">[AI]</span>
        </span>
      </div>
      <details>
        <summary>Sources & privacy</summary>
        <p>
          Synthetic-data demonstration. No real child profiles. Text filtering
          is imperfect. Voice is disabled.
        </p>
        <p>
          O*NET® data: U.S. Department of Labor, Employment and Training
          Administration (USDOL/ETA). Used under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
          BYDT translations and missions are adaptations; USDOL/ETA has not
          approved or endorsed them.{" "}
          <a href="https://www.onetcenter.org/database.html">O*NET Database</a>{" "}
          · <a href="https://services.onetcenter.org/">O*NET Web Services</a> ·{" "}
          <a href="https://services.onetcenter.org/terms">Web Services terms</a>
          . Fixtures are illustrative and explicitly labeled.
        </p>
      </details>
      <Link href="/explore">
        Explore O*NET <ArrowUpRight size={14} />
      </Link>
    </footer>
  );
}
