import { Container } from "./Container";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#technology", label: "Technology" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about", label: "About" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              ActiGait ExoSuit is a lower-limb exoskeleton concept for adaptive
              gait assistance, mobility support, and human-centered
              rehabilitation research.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Navigate
            </p>
            <ul className="mt-4 space-y-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink/90 hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Project
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink/90">
              <li>
                <a
                  href="https://github.com/"
                  className="hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                >
                  GitHub (placeholder)
                </a>
              </li>
              <li className="text-muted">Contributors: research & design team</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-line pt-6 font-mono text-[11px] tracking-wide text-muted">
          © 2026 ActiGait ExoSuit. Concept interface for
          education and prototype demonstration.
        </p>
      </Container>
    </footer>
  );
}
