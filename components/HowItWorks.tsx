import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Sense",
    body: "On-body sensors observe joint angles, timing, and load as the wearer initiates a step.",
  },
  {
    n: "02",
    title: "Interpret",
    body: "Control software estimates gait phase and likely intent, rather than forcing a rigid walking script.",
  },
  {
    n: "03",
    title: "Assist",
    body: "Actuators apply timed support at selected joints, staying inside predefined assistance bounds.",
  },
  {
    n: "04",
    title: "Adapt",
    body: "The system continues to update as cadence, terrain, or fatigue change—so help can stay proportional.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="How it works"
            title="Four steps in every stride."
            description="The control story is deliberately simple: observe the wearer, understand the moment, help, then learn from what just happened."
          />
        </FadeIn>
        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute top-[18px] right-8 left-8 hidden h-px bg-gradient-to-r from-cyan/0 via-cyan/40 to-cyan/0 lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-8 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.n} className="relative">
                <FadeIn delay={index * 0.08}>
                  <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 bg-bg font-mono text-xs text-cyan">
                    {step.n}
                  </span>
                  <h3 className="font-display mt-5 text-xl font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
