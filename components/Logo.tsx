type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <a
      href="#top"
      className={`group inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan ${className}`}
      aria-label="ActiGait ExoSuit home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7"
          stroke="currentColor"
          className="text-cyan/70"
          strokeWidth="1.2"
        />
        <path
          d="M9 22.5V9.5h5.2c2.9 0 4.8 1.7 4.8 4.3 0 2.7-1.9 4.4-4.8 4.4H12.4"
          stroke="currentColor"
          className="text-ink"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 22.5h14"
          stroke="currentColor"
          className="text-cyan"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          ActiGait
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          ExoSuit
        </span>
      </span>
    </a>
  );
}
