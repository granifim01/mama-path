"use client";

type Props = {
  name?: string;
  color?: string;
};

/** Lightweight CSS/SVG motion illustrations for chapter phases. */
export function ChapterIllustration({ name = "heartbeat", color = "#d4567f" }: Props) {
  return (
    <div className={`chapter-illo chapter-illo--${name}`} aria-hidden>
      <svg viewBox="0 0 160 96" className="chapter-illo__svg">
        <defs>
          <linearGradient id="illoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="160" height="96" rx="18" fill="url(#illoGrad)" opacity="0.12" />
        {name === "heartbeat" && (
          <path
            className="chapter-illo__pulse"
            d="M12 52 H40 L50 28 L66 70 L78 40 L90 52 H148"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {name === "seed" && (
          <>
            <ellipse className="chapter-illo__bob" cx="80" cy="58" rx="18" ry="22" fill={color} opacity="0.85" />
            <path d="M80 36 C70 20, 52 18, 48 28 C60 30, 72 36, 80 48 Z" fill={color} opacity="0.55" />
          </>
        )}
        {name === "bloom" && (
          <>
            <circle className="chapter-illo__bob" cx="80" cy="48" r="16" fill={color} />
            <circle cx="58" cy="48" r="12" fill={color} opacity="0.55" />
            <circle cx="102" cy="48" r="12" fill={color} opacity="0.55" />
            <circle cx="80" cy="28" r="12" fill={color} opacity="0.55" />
            <circle cx="80" cy="68" r="12" fill={color} opacity="0.55" />
          </>
        )}
        {name === "bag" && (
          <path
            className="chapter-illo__bob"
            d="M48 40 H112 V78 H48 Z M64 40 C64 28 96 28 96 40"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}
        {name === "route" && (
          <>
            <circle cx="36" cy="60" r="8" fill={color} />
            <circle className="chapter-illo__bob" cx="124" cy="32" r="8" fill={color} />
            <path
              d="M44 56 C70 20, 100 90, 116 38"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray="6 6"
              className="chapter-illo__dash"
            />
          </>
        )}
        {name === "moon" && (
          <>
            <circle className="chapter-illo__bob" cx="86" cy="48" r="22" fill={color} opacity="0.9" />
            <circle cx="96" cy="42" r="18" fill="#fff8f4" />
          </>
        )}
      </svg>
    </div>
  );
}
