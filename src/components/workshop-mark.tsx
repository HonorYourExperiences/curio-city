/** Small, original geometric symbols. SVGs are decorative; the nearby label supplies meaning. */
export function WorkshopMark({
  kind,
  className = "",
}: {
  kind: "build" | "mechanics" | "care" | "idea" | "spotter" | "skill";
  className?: string;
}) {
  return (
    <svg
      className={`workshop-mark mark-${kind} ${className}`}
      viewBox="0 0 120 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "build" ? (
        <>
          <path
            d="M18 77H103"
            stroke="#38234F"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M24 72L58 22L94 72H24Z" fill="#F9845C" />
          <path d="M58 22V72H94L58 22Z" fill="#E6613B" />
          <path
            d="M58 22V72M24 72L58 48L94 72"
            stroke="#FFF4D9"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="20" y="74" width="19" height="10" rx="2" fill="#B59DDC" />
          <rect x="80" y="74" width="19" height="10" rx="2" fill="#B59DDC" />
          <circle cx="96" cy="21" r="8" fill="#F2C56C" />
        </>
      ) : kind === "mechanics" ? (
        <>
          <circle cx="43" cy="61" r="29" fill="#B59BDF" />
          <path
            d="M70 17L76 22L84 20L88 28L96 30L95 39L101 45L96 52L97 61L88 64L84 72L76 70L69 76L63 70L55 71L51 63L43 60L44 51L38 45L44 38L43 30L52 27L56 19L64 22L70 17Z"
            fill="#7550BA"
          />
          <circle cx="70" cy="46" r="13" fill="#F6EACD" />
          <circle cx="43" cy="61" r="8" fill="#F6EACD" />
          <path
            d="M15 22H32M23 14V31"
            stroke="#E6A554"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : kind === "care" ? (
        <>
          <circle cx="40" cy="28" r="12" fill="#7156A7" />
          <circle cx="79" cy="28" r="12" fill="#E98965" />
          <path
            d="M18 76V64C18 49 27 42 40 42C53 42 62 51 62 64V76"
            fill="#A98CCD"
          />
          <path
            d="M57 76V64C57 49 66 42 79 42C92 42 101 51 101 64V76"
            fill="#F3AC86"
          />
          <path
            d="M60 84L43 68C31 57 45 44 55 54L60 59L65 54C75 44 89 57 77 68L60 84Z"
            fill="#ED704B"
            stroke="#FFF5E1"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      ) : kind === "idea" ? (
        <>
          <path
            d="M44 67C44 57 30 51 30 36C30 19 43 9 60 9C77 9 90 19 90 36C90 51 76 57 76 67H44Z"
            fill="#E9BD61"
          />
          <path
            d="M60 66V40L49 31M60 40L71 31"
            stroke="#FFF4D9"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M45 69H75V80H45V69ZM50 84H70L65 91H55L50 84Z"
            fill="#8262BE"
          />
          <path
            d="M13 32H19M101 32H107M24 7L29 12M91 12L96 7"
            stroke="#C59B3A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : kind === "spotter" ? (
        <>
          <circle
            cx="54"
            cy="39"
            r="26"
            fill="#FFF5DE"
            stroke="#8B6AB8"
            strokeWidth="9"
          />
          <path
            d="M74 60L97 83"
            stroke="#E58256"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M44 40L51 47L65 32"
            stroke="#629771"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="76" r="5" fill="#BBA3D9" />
        </>
      ) : (
        <>
          <path d="M25 75L48 27L70 75H25Z" fill="#D4975C" />
          <rect x="62" y="43" width="31" height="32" rx="5" fill="#B5CFAC" />
          <circle cx="82" cy="26" r="14" fill="#9778C9" />
          <path
            d="M20 81H102"
            stroke="#5B436B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
