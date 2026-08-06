import { site } from "@/data/site";

/**
 * A fixed, page-wide engineering-drawing frame: viewfinder corner marks, a
 * title-block label and a rotated margin note. Purely typographic and
 * non-interactive — quiet enough to read as a technical document's border,
 * not a UI widget.
 */
export default function TechnicalFrame() {
  const cornerBase = "fixed h-4 w-4 border-zinc-500/30";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      <span className={`${cornerBase} left-3.5 top-3.5 border-l border-t`} />
      <span className={`${cornerBase} right-3.5 top-3.5 border-r border-t`} />
      <span className={`${cornerBase} bottom-3.5 left-3.5 border-b border-l`} />
      <span className={`${cornerBase} bottom-3.5 right-3.5 border-b border-r`} />

      {/* title block, bottom-right */}
      <span className="fixed bottom-6 right-8 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600/60 md:block">
        Sheet 1/1 · Rev A
      </span>

      {/* rotated margin note, right edge, desktop only */}
      <span
        className="fixed right-6 top-1/2 hidden -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500/20 lg:block"
        style={{ writingMode: "vertical-rl" }}
      >
        {site.name} · {site.title}
      </span>
    </div>
  );
}
