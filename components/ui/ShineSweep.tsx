/** Diagonal light streak that sweeps across the parent on hover — parent needs `group relative overflow-hidden`. */
export function ShineSweep() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
      style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)" }}
    />
  );
}
