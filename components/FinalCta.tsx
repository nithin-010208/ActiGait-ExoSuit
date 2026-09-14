import { Button } from "./Button";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";

export function FinalCta() {
  return (
    <section className="pb-20 sm:pb-28" aria-labelledby="cta-heading">
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-line px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 hero-wash" />
            <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" />
            <div className="relative">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan">
                Next step
              </p>
              <h2
                id="cta-heading"
                className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
              >
                Explore the system, or start a conversation.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
                Whether you are reviewing the architecture, studying wearable
                robotics, or connecting with the team, ActiGait is built to be
                examined in the open.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="#technology">Explore the Technology</Button>
                <Button href="#about" variant="secondary">
                  Connect with the team
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
