type HudCornersProps = { className?: string };

export default function HudCorners({ className = "" }: HudCornersProps) {
  const base = "absolute h-3 w-3 border-brand-orange/50";
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <span className={`${base} left-3 top-3 border-l-2 border-t-2`} />
      <span className={`${base} right-3 top-3 border-r-2 border-t-2`} />
      <span className={`${base} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${base} bottom-3 right-3 border-b-2 border-r-2`} />
    </div>
  );
}