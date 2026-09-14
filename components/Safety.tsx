import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

const PILLARS = [
  {
    title: "Comfort first",
    body: "Interfaces, padding, and alignment are treated as engineering problems—not afterthoughts—because a device that hurts will not be worn.",
  },
  {
    title: "Controlled assistance",
    body: "Support is meant to be bounded, inspectable, and interruptible. The wearer should always understand whether the suit is helping, holding, or idle.",
  },
  {
    title: "Personalization",
    body: "Bodies, gaits, and goals differ. The concept assumes fitting, tuning, and clinician-informed setup rather than a universal walking program.",
  },
  {
    title: "Responsible development",
    body: "ActiGait is a research and design concept. It does not claim clinical outcomes, regulatory clearance, or replacement of professional care.",
  },
] as const;

export function Safety() {
  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <FadeIn>
            <SectionHeading
              eyebrow="Safety & people"
              title="Human-centered by design."
              description="Mobility technology earns trust when it is comfortable, controllable, and honest about what it can and cannot do."
            />
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <FadeIn key={pillar.title} delay={index * 0.06}>
                <article className="h-full rounded-2xl border border-line p-5">
                  <h3 className="text-sm font-semibold text-ink">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {pillar.body}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
