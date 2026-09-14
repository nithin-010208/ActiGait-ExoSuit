import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

const FEATURES = [
  {
    title: "Adaptive gait assistance",
    body: "Support is intended to follow the walking cycle—helping where demand rises and receding when the wearer needs less.",
    icon: "gait",
  },
  {
    title: "Real-time movement monitoring",
    body: "A sensing layer tracks joint motion and timing so the control system can stay aligned with the current stride.",
    icon: "monitor",
  },
  {
    title: "Personalized support",
    body: "Profiles can be tuned for body size, preferred cadence, and assistance intensity instead of a one-size-fits-all map.",
    icon: "person",
  },
  {
    title: "Lightweight wearable design",
    body: "Load paths and materials are conceived to keep mass close to the body, reducing bulk while preserving structure.",
    icon: "weight",
  },
  {
    title: "Safety-first control",
    body: "Assistance is bounded, states are visible, and the wearer remains able to disengage support in the interaction model.",
    icon: "shield",
  },
  {
    title: "Data-driven insights",
    body: "Session traces can help clinicians and engineers review gait patterns over time—without treating data as a diagnosis.",
    icon: "data",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Capabilities"
            title="Designed around the walking body."
            description="Each capability is a design goal for the ExoSuit concept: precise enough for engineering, clear enough for the people who would wear it."
          />
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.05}>
              <article className="group h-full rounded-2xl border border-line bg-bg-elevated/50 p-6 transition-colors hover:border-cyan/25">
                <FeatureIcon name={feature.icon} />
                <h3 className="font-display mt-5 text-lg font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {feature.body}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-cyan",
    "aria-hidden": true as const,
  };

  return (
    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-black/20">
      {name === "gait" ? (
        <svg {...common}>
          <path d="M7 20l3-7 4 3 3-8" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      ) : null}
      {name === "monitor" ? (
        <svg {...common}>
          <path d="M4 12h3l2-5 3 10 2-5h6" />
        </svg>
      ) : null}
      {name === "person" ? (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
        </svg>
      ) : null}
      {name === "weight" ? (
        <svg {...common}>
          <path d="M8 8h8v10H8z" />
          <path d="M10 8V6h4v2" />
        </svg>
      ) : null}
      {name === "shield" ? (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
        </svg>
      ) : null}
      {name === "data" ? (
        <svg {...common}>
          <path d="M6 16V8M12 16V4M18 16v-6" />
        </svg>
      ) : null}
    </div>
  );
}
