"use client";

import { useEffect, useState } from "react";

function Dot({ color = "cyan" }: { color?: "cyan" | "green" | "amber" }) {
  return <span className={`status-dot status-dot-${color}`} aria-hidden="true" />;
}

function BrandMark() {
  return <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>;
}

export default function OperatorProfile() {
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const profileButton = document.querySelector<HTMLElement>(".user-row");
    const openProfile = () => setOpen(true);
    profileButton?.setAttribute("role", "button");
    profileButton?.setAttribute("tabindex", "0");
    profileButton?.setAttribute("aria-label", "Open operator profile");
    profileButton?.addEventListener("click", openProfile);
    profileButton?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") openProfile();
    });
    return () => profileButton?.removeEventListener("click", openProfile);
  }, []);

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 2600);
  };

  if (locked) {
    return <main className="locked-console"><div className="locked-card"><div className="locked-mark"><BrandMark /></div><span className="section-kicker">ACTIGAIT EXOSUIT / LOCAL DEMO</span><h1>Console locked</h1><p>Operator access is paused locally. No credentials or backend authentication are used in this prototype.</p><div className="locked-status"><Dot color="amber" /> Session data retained locally</div><button className="session-button start-session" onClick={() => { setLocked(false); showMessage("Demo console unlocked."); }}>Unlock demo console</button></div></main>;
  }

  return <>
    {open && <button className="operator-scrim" aria-label="Close operator profile" onClick={() => setOpen(false)} />}
    {open && <aside className="operator-popover" role="dialog" aria-modal="true" aria-labelledby="operator-panel-title"><div className="operator-panel-header"><div><span className="section-kicker">OPERATOR CONSOLE / DEMO</span><h2 id="operator-panel-title">Operator profile</h2></div><button className="operator-close" onClick={() => setOpen(false)} aria-label="Close profile panel">x</button></div><div className="operator-identity"><div className="operator-avatar">DR</div><div><strong>Dr. Riley Morgan</strong><span>Clinical Operator</span><em>Fictional demo operator information</em></div></div><div className="operator-facts"><div><span>Operator ID</span><strong>OP-0418</strong></div><div><span>Connected device</span><strong>AG-X / 0418</strong></div><div><span>Current session</span><strong><Dot color="green" /> Active / simulated</strong></div><div><span>Access level</span><strong>Clinical operator</strong></div><div><span>Calibration status</span><strong><Dot color="green" /> Ready / demo</strong></div><div><span>Simulation mode</span><strong>Local demo</strong></div><div><span>Console version</span><strong>OS 2.4.1</strong></div></div><div className="operator-actions"><button onClick={() => showMessage("Operator profile is already open.")}>View operator profile <span>-&gt;</span></button><button onClick={() => showMessage("Session preferences are available in Settings.")}>Session preferences <span>-&gt;</span></button><button onClick={() => showMessage("Safety information is available in Settings.")}>Safety information <span>-&gt;</span></button><button className="operator-lock" onClick={() => { setOpen(false); setLocked(true); }}>Lock console <span>-&gt;</span></button></div>{message && <div className="operator-message" role="status"><Dot color="cyan" />{message}</div>}</aside>}
  </>;
}
