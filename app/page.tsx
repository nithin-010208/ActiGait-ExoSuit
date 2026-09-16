"use client";

import Link from "next/link";
import { useState } from "react";

function BrandMark() {
  return <span className="home-brand-mark" aria-hidden="true"><i /><i /><i /></span>;
}

export default function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className="home-shell">
      <nav className="home-nav">
        <Link className="home-brand" href="/">
          <BrandMark />
          <span><strong>ACTIGAIT</strong><small>EXOSUIT / OS 2.4</small></span>
        </Link>

        <div className="home-nav-links">
          <Link href="/dashboard/gait-analysis">Gait analysis</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Create account</Link>
        </div>

        <Link className="home-nav-cta" href="/signup">
          <span>Create account</span>
          <b>-&gt;</b>
        </Link>
      </nav>

      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-kicker">
            <span className="home-pulse" /> LOCAL DEMO / EXOSUIT OPERATING SYSTEM
          </div>

          <h1>Movement, <em>made intelligent.</em></h1>
          <p>ActiGait is a simulated exosuit control platform for exploring movement intent, gait signals, and adaptive assistance in one focused workspace.</p>

          <div className="home-auth-actions" aria-label="Authentication actions">
            <Link className="home-primary home-session-submit" href="/signup">
              Create account <span>-&gt;</span>
            </Link>
            <Link className="home-secondary" href="/login">
              Log in
            </Link>
          </div>

          <div className="home-actions">
            <Link className="home-secondary" href="/dashboard/gait-analysis">Explore gait analysis</Link>
            <button className="home-about-link" type="button" onClick={() => setAboutOpen(true)}>
              Understand ActiGait <span>+</span>
            </button>
          </div>

          <div className="home-disclaimer">
            <span>i</span>
            <span>SIMULATED INTERFACE</span>
            <p>All readings are local demo values for product exploration. No medical device is connected.</p>
          </div>
        </div>

        <div className="home-system-visual" aria-hidden="true">
          <div className="home-figure">
            <div className="home-orbit home-orbit-outer">
              <div className="home-orbit home-orbit-inner">
                <span className="home-core" />
              </div>
            </div>
            <div className="home-visual-limb home-visual-hip" />
            <div className="home-visual-limb home-visual-thigh" />
            <div className="home-visual-limb home-visual-shin" />
            <div className="home-visual-limb home-visual-ankle" />
            <div className="home-signal home-signal-a" />
            <div className="home-signal home-signal-b" />
            <div className="home-signal home-signal-c" />
          </div>
          <div className="home-floating-card">
            <span className="home-float-title">System telemetry</span>
            <strong>94% gait stability</strong>
            <small>Adaptive assistance ready</small>
          </div>
        </div>
      </section>

      <section className="home-strip">
        <div><strong>32</strong><span>sensor nodes</span></div>
        <div><strong>6.2 ms</strong><span>signal loop</span></div>
        <div><strong>94%</strong><span>demo symmetry</span></div>
        <div><strong>ML</strong><span>assist model</span></div>
      </section>

      <section className="home-builders">
        <div className="home-builders-heading">
          <div>
            <span className="section-kicker">BUILDERS / RESEARCH TEAM</span>
            <h2>Built for movement intelligence.</h2>
          </div>
          <p>ActiGait is shaped by a cross-functional team exploring biomechanics, embedded systems, and intelligent assistive design.</p>
        </div>

        <div className="home-builder-list">
          <div><strong>Nithin</strong><span>Full stack UI and insights</span></div>
          <div><strong>Farzaan</strong><span>ML &amp; biomechanics analyst</span></div>
          <div><strong>Kamalesh</strong><span>Backend and data architect</span></div>
          <div><strong>Sanjai</strong><span>Lead embedded engineer</span></div>
          <div><strong>Deivani</strong><span>Hardware and telemetry bridge</span></div>
        </div>
      </section>

      {aboutOpen && (
        <div className="home-about-scrim" onClick={() => setAboutOpen(false)}>
          <div className="home-about-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="home-about-header">
              <div>
                <span className="section-kicker">ABOUT ACTIGAIT</span>
                <h2>What this platform explores.</h2>
              </div>
              <button type="button" aria-label="Close explanation" onClick={() => setAboutOpen(false)}>x</button>
            </div>

            <div className="home-about-grid">
              <div><strong>Exosuit</strong><p>An exosuit is a wearable support system designed to assist movement and amplify human control, often across the hip, knee, or ankle during walking and recovery.</p></div>
              <div><strong>Gait</strong><p>Gait refers to the pattern of walking or stepping, including timing, load distribution, cadence, and movement symmetry.</p></div>
              <div><strong>Gait analysis</strong><p>Gait analysis studies how someone moves across a cycle to identify patterns, instability, asymmetry, or opportunities for adaptive assistance.</p></div>
              <div><strong>ActiGait</strong><p>ActiGait combines machine learning, biomechanics, embedded systems, telemetry, and backend data to model how adaptive support could respond in a simulated workspace.</p></div>
              <div><strong>Local demo</strong><p>This interface is a local simulation for research, prototyping, exploration, and demonstration. It is not connected to real hardware.</p></div>
              <div><strong>Research context</strong><p>It is designed for experimentation and concept work, not as a clinically validated medical device or treatment recommendation.</p></div>
            </div>
          </div>
        </div>
      )}

      <footer className="home-footer">
        <span>ActiGait / simulated exosuit platform</span>
        <span>Research, prototyping, and motion intelligence.</span>
      </footer>
    </main>
  );
}

