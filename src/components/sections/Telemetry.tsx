import Reveal from "@/components/ui/Reveal";
import TechnicalCorners from "@/components/ui/TechnicalCorners";
import TiltCard from "@/components/ui/TiltCard";
import StatCounter from "@/components/ui/StatCounter";
import { stats } from "@/data/stats";

/** A cockpit-telemetry-styled stat strip — the numbers behind the CV, read like instrument readouts. */
export default function Telemetry() {
  return (
    <section className="relative border-y border-subtle bg-surface/60 py-14 md:py-16">
      <div className="mx-auto w-full max-w-content px-6 md:px-8">
        <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Sistem Özeti — Sahada Ölçülen Sayılar
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} variant="scale" delay={i * 0.07}>
              <div className="group relative rounded-xl border border-subtle bg-card/80">
                <TechnicalCorners />
                <TiltCard className="overflow-hidden rounded-xl p-5" maxTilt={6}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    T-{String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
                    {typeof stat.value === "number" ? (
                      <StatCounter value={stat.value} suffix={stat.suffix} />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium text-accent/90">{stat.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{stat.sub}</p>
                </TiltCard>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <SignalDivider />
    </section>
  );
}

/** Thin oscilloscope-style trace along the bottom edge — a nod to signal processing, not decoration for its own sake. */
function SignalDivider() {
  return (
    <svg
      viewBox="0 0 800 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-3 h-6 w-full opacity-40"
    >
      <path
        d="M0 12 Q 20 12 30 4 T 60 12 T 90 20 T 120 12 T 150 4 T 180 12 T 210 20 T 240 12 T 270 4 T 300 12 T 330 20 T 360 12 T 390 4 T 420 12 T 450 20 T 480 12 T 510 4 T 540 12 T 570 20 T 600 12 T 630 4 T 660 12 T 690 20 T 720 12 T 750 4 T 780 12 T 810 12"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="1.5"
        className="signal-line"
      />
    </svg>
  );
}
