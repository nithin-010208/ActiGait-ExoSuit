"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Container } from "./Container";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "#technology", label: "Technology" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled || open
          ? "border-line bg-[#07080c]/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between sm:h-[72px]">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button href="#technology">Explore the Technology</Button>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 5h12M3 9h12M3 13h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </Container>
      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-[#07080c] lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href="#technology" className="mt-3 w-full" >
              Explore the Technology
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
