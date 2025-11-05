import React from "react";

export const UrlScheduleProviderLogo: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Calendar base */}
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />

    {/* Calendar header */}
    <rect
      x="3"
      y="4"
      width="18"
      height="4"
      rx="2"
      ry="2"
      fill="currentColor"
      opacity="0.2"
    />

    {/* Calendar rings */}
    <rect x="8" y="2" width="2" height="4" fill="currentColor" />
    <rect x="14" y="2" width="2" height="4" fill="currentColor" />

    {/* Calendar grid lines */}
    <line
      x1="9"
      y1="8"
      x2="9"
      y2="20"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
    <line
      x1="15"
      y1="8"
      x2="15"
      y2="20"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
    <line
      x1="3"
      y1="16"
      x2="21"
      y2="16"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />

    {/* Schedule time blocks */}
    <rect x="4" y="9" width="4" height="2" fill="currentColor" opacity="0.7" />
    <rect x="10" y="9" width="4" height="2" fill="currentColor" opacity="0.7" />
    <rect x="16" y="9" width="4" height="2" fill="currentColor" opacity="0.7" />

    {/* Small busy event indicators */}
    <circle cx="6" cy="10" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="6" cy="18" r="1" fill="currentColor" opacity="0.6" />

    {/* Link icon in bottom right corner */}
    <g transform="translate(12,12) scale(0.3)">
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
