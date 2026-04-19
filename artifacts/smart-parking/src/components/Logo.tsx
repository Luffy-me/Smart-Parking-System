export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="parqLogoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="hsl(173 80% 42%)" />
          <stop offset="1" stopColor="hsl(160 84% 35%)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#parqLogoGrad)" />
      <path d="M22 16h12.5a10.5 10.5 0 0 1 0 21H28v11h-6V16Zm6 6v9h6.2a4.5 4.5 0 0 0 0-9H28Z" fill="#fff" />
      <circle cx="48" cy="48" r="4" fill="#fff" fillOpacity=".95" />
      <circle cx="48" cy="48" r="2" fill="hsl(160 84% 28%)" />
    </svg>
  );
}
