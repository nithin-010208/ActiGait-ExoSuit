type ExosuitGraphicProps = {
  className?: string;
  showHud?: boolean;
};

export function ExosuitGraphic({
  className = "",
  showHud = true,
}: ExosuitGraphicProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 520 640"
        className="h-auto w-full"
        role="img"
        aria-labelledby="exosuit-title exosuit-desc"
      >
        <title id="exosuit-title">Conceptual ActiGait ExoSuit diagram</title>
        <desc id="exosuit-desc">
          A technical illustration of a lower-limb exoskeleton frame over a
          stylized human silhouette. This is a conceptual visualization, not a
          clinical product photograph.
        </desc>
        <defs>
          <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9fd7ff" />
            <stop offset="55%" stopColor="#5ce1e6" />
            <stop offset="100%" stopColor="#8b7cff" />
          </linearGradient>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c2433" />
            <stop offset="100%" stopColor="#10151f" />
          </linearGradient>
          <radialGradient id="stageGlow" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(92,225,230,0.22)" />
            <stop offset="70%" stopColor="rgba(92,225,230,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="260" cy="560" rx="170" ry="28" fill="url(#stageGlow)" />
        <ellipse
          cx="260"
          cy="560"
          rx="148"
          ry="18"
          fill="none"
          stroke="rgba(92,225,230,0.18)"
        />

        {/* Human silhouette */}
        <path
          d="M260 78c18 0 32 14 32 32s-14 32-32 32-32-14-32-32 14-32 32-32z"
          fill="url(#bodyFill)"
          stroke="rgba(186,214,255,0.22)"
        />
        <path
          d="M214 150c18-10 74-10 92 0 10 6 16 18 18 32l8 86c2 18-8 30-24 34l-12 4v54l38 118 8 62-28 8-22-66-18-92h-12l-18 92-22 66-28-8 8-62 38-118v-54l-12-4c-16-4-26-16-24-34l8-86c2-14 8-26 18-32z"
          fill="url(#bodyFill)"
          stroke="rgba(186,214,255,0.18)"
        />

        {/* Pelvic harness */}
        <path
          d="M196 236h128"
          stroke="url(#frame)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#softGlow)"
        />
        <rect
          x="188"
          y="224"
          width="144"
          height="26"
          rx="8"
          fill="none"
          stroke="url(#frame)"
          strokeWidth="2"
        />

        {/* Thigh struts */}
        <path
          d="M214 250l-18 118M306 250l18 118"
          stroke="url(#frame)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M226 250l-10 118M294 250l10 118"
          stroke="rgba(110,168,255,0.45)"
          strokeWidth="1.4"
        />

        {/* Knee actuators */}
        <circle cx="196" cy="378" r="18" fill="#0c1118" stroke="url(#frame)" strokeWidth="2.4" />
        <circle cx="324" cy="378" r="18" fill="#0c1118" stroke="url(#frame)" strokeWidth="2.4" />
        <circle cx="196" cy="378" r="6" className="joint-pulse" fill="#5ce1e6" />
        <circle cx="324" cy="378" r="6" className="joint-pulse" fill="#5ce1e6" />

        {/* Shank struts */}
        <path
          d="M196 396l-8 108M324 396l8 108"
          stroke="url(#frame)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Ankle cuffs */}
        <rect x="170" y="500" width="40" height="18" rx="6" fill="#0c1118" stroke="url(#frame)" />
        <rect x="310" y="500" width="40" height="18" rx="6" fill="#0c1118" stroke="url(#frame)" />
        <circle cx="190" cy="509" r="4" className="joint-pulse" fill="#6ea8ff" />
        <circle cx="330" cy="509" r="4" className="joint-pulse" fill="#6ea8ff" />

        {/* Foot plates */}
        <path
          d="M154 534h52l8 16H150zM314 534h52l4 16H310z"
          fill="#10151f"
          stroke="url(#frame)"
          strokeWidth="1.6"
        />

        {/* Hip sensors */}
        <circle cx="210" cy="236" r="5" fill="#8b7cff" className="joint-pulse" />
        <circle cx="310" cy="236" r="5" fill="#8b7cff" className="joint-pulse" />

        {/* Cable traces */}
        <path
          d="M210 236c-28 18-40 70-18 142M310 236c28 18 40 70 18 142"
          fill="none"
          stroke="rgba(92,225,230,0.28)"
          strokeDasharray="3 6"
        />
      </svg>

      {showHud ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-[8%] hidden overflow-hidden sm:block">
            <div className="scan-line mx-auto h-px w-3/5 bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
          </div>
          <HudChip className="absolute left-0 top-[22%] hidden sm:flex" label="HIP" value="Load share" />
          <HudChip className="absolute right-0 top-[46%] hidden sm:flex" label="KNEE" value="Assist map" />
          <HudChip className="absolute left-2 bottom-[18%] hidden sm:flex" label="ANKLE" value="Push-off" />
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Conceptual system diagram — not a product photograph
          </p>
        </>
      ) : (
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Conceptual system diagram — not a product photograph
        </p>
      )}
    </div>
  );
}

function HudChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`glass items-center gap-3 rounded-full px-3 py-1.5 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
      <span className="font-mono text-[10px] tracking-[0.18em] text-cyan">
        {label}
      </span>
      <span className="text-xs text-muted">{value}</span>
    </div>
  );
}
