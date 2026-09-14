import { Button } from "./Button";
import { Container } from "./Container";
import { ExosuitGraphic } from "./ExosuitGraphic";

export function Hero() {
  return (
    <section className="relative overflow-hidden hero-wash" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
            Lower-limb assistance concept
          </p>
          <h1
            id="hero-heading"
            className="font-display mt-6 max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.05]"
          >
            Reimagining Human Mobility.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            ActiGait ExoSuit is a next-generation wearable robotics concept for
            gait assistance. It is designed to sense movement, interpret gait
            patterns, and deliver adaptive support—keeping the wearer at the
            center of every control decision.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="#technology">Explore the Technology</Button>
            <Button href="#how-it-works" variant="secondary">
              See how it works
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            <HeroStat label="Focus" value="Gait" />
            <HeroStat label="Loop" value="Closed" />
            <HeroStat label="Priority" value="Safety" />
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-cyan/5 blur-2xl" />
          <ExosuitGraphic />
        </div>
      </Container>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
