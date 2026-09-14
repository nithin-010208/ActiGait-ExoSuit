import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

const STAGES = [
  {
    step: "01",
    title: "Sensors",
    body: "Wearable IMUs, joint encoders, and load cues capture how the wearer is moving—stride to stride.",
  },
  {
    step: "02",
    title: "Intelligent Control",
    body: "Onboard software interprets gait phase and intent, then plans assistance that stays within defined limits.",
  },
  {
    step: "03",
    title: "Assisted Movement",
    body: "Actuators at the hip, knee, and ankle deliver timed support so walking can feel more stable and less effortful.",
  },
] as const;

export function Technology() {
  return (
    <section id="technology" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Technology"
            title="From signal to support."
            description="ActiGait is conceived as a closed-loop system: sense the body, interpret the gait cycle, and assist only as much as the moment requires."
          />
        </FadeIn>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {STAGES.map((stage, index) => (
            <FadeIn key={stage.step} delay={index * 0.08}>
              <article className="glass relative h-full rounded-2xl p-6 sm:p-7">
                <p className="font-mono text-xs text-cyan">{stage.step}</p>
                <h3 className="font-display mt-4 text-xl font-semibold text-ink">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {stage.body}
                </p>
                {index < STAGES.length - 1 ? (
                  <span
                    className="pointer-events-none absolute top-1/2 -right-3 hidden h-px w-6 bg-cyan/40 lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
