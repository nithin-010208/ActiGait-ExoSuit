import { Container } from "./Container";
import { ExosuitGraphic } from "./ExosuitGraphic";
import { FadeIn } from "./FadeIn";
import { SectionHeading } from "./SectionHeading";

const CALLOUTS = [
  {
    title: "Pelvic interface",
    body: "A structured harness is intended to transfer assistive loads without fighting natural hip motion.",
  },
  {
    title: "Joint actuators",
    body: "Knee and ankle modules are placed to support stance and swing with clearly bounded torque.",
  },
  {
    title: "Sensor spine",
    body: "Motion and load sensing along the limb give the controller a continuous picture of gait phase.",
  },
  {
    title: "Wearable architecture",
    body: "Struts and cuffs are conceived as a lightweight frame that can be fitted, adjusted, and understood.",
  },
] as const;

export function ProductShowcase() {
  return (
    <section
      id="product"
      className="scroll-mt-24 border-y border-line py-20 sm:py-28"
      aria-labelledby="showcase-heading"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeIn>
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 tech-grid rounded-3xl opacity-50" />
              <ExosuitGraphic showHud={false} />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading
              id="showcase-heading"
              eyebrow="Product architecture"
              title="A wearable frame, not a costume."
            />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              This illustration is a conceptual technical visualization of the
              ActiGait ExoSuit. It shows how a lower-limb frame could sit on the
              body—harness, actuators, and sensors working as one system. It is
              not a clinical product photograph.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {CALLOUTS.map((item) => (
                <li key={item.title}>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
