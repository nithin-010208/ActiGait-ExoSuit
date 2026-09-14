import { Container } from "./Container";

const METRICS = [
  {
    label: "Adaptive Assistance",
    detail: "Support intended to scale with gait demand",
  },
  {
    label: "Real-Time Sensing",
    detail: "Joint, load, and motion signals in the control loop",
  },
  {
    label: "Human-Centered Design",
    detail: "Fit, comfort, and wearer agency as first principles",
  },
  {
    label: "Safety-First Control",
    detail: "Bounded assistance with transparent system states",
  },
] as const;

export function MetricsStrip() {
  return (
    <section
      aria-label="System principles"
      className="border-y border-line bg-bg-elevated/60"
    >
      <Container className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((item) => (
          <div key={item.label} className="px-1 py-7 sm:px-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
