/**
 * Fiducial-style corner marks, like the alignment marks on a PCB.
 * Parent must be `relative group` — marks light up accent-blue on hover.
 */
export default function TechnicalCorners() {
  const base =
    "pointer-events-none absolute h-2.5 w-2.5 border-zinc-600/50 transition-colors duration-300 group-hover:border-accent/70";
  return (
    <>
      <span className={`${base} left-1.5 top-1.5 border-l border-t`} />
      <span className={`${base} right-1.5 top-1.5 border-r border-t`} />
      <span className={`${base} bottom-1.5 left-1.5 border-b border-l`} />
      <span className={`${base} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  );
}
