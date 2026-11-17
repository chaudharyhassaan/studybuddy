export default function LogoMark({ className = '', title }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      <rect
        x="10.5"
        y="4.5"
        width="16"
        height="20"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect x="5.5" y="7.5" width="16" height="20" rx="2.5" fill="currentColor" />
      <path
        d="M10 13.5h7M10 17.5h7M10 21.5h4.5"
        stroke="var(--color-on-accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
