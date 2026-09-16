"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

type Mode = "Adaptive" | "Training" | "Manual";
type ViewKey = "Overview" | "Live session" | "Gait analysis" | "Session history" | "Settings";
type Simulation = { phase: number; velocity: number; cadence: number; stride: number; contact: number; symmetry: number; leftLoad: number; rightLoad: number; telemetry: number[] };
type Notice = { message: string; tone: "success" | "info" };

const navigation: Array<[ViewKey, string]> = [["Overview", "OV"], ["Live session", "LS"], ["Gait analysis", "GA"], ["Session history", "SH"], ["Settings", "ST"]];
const sessions = [
  { date: "Today, 09:42", duration: "18m 24s", steps: "1,284", symmetry: "94%", mode: "Adaptive", status: "Completed" },
  { date: "Yesterday, 16:18", duration: "24m 07s", steps: "1,752", symmetry: "91%", mode: "Training", status: "Completed" },
  { date: "Yesterday, 10:06", duration: "12m 41s", steps: "904", symmetry: "89%", mode: "Adaptive", status: "Completed" },
  { date: "Sep 12, 14:32", duration: "08m 15s", steps: "516", symmetry: "87%", mode: "Manual", status: "Ended early" },
];
const initialSimulation: Simulation = { phase: .18, velocity: 1.18, cadence: 112, stride: .68, contact: .42, symmetry: 94, leftLoad: 51, rightLoad: 49, telemetry: [32, 48, 42, 68, 52, 75, 58, 66, 44, 82, 61, 72, 49, 77, 64, 88, 70, 83, 57, 74, 66, 91, 76, 86] };

function Dot({ color = "cyan" }: { color?: "cyan" | "green" | "amber" }) { return <span className={`status-dot status-dot-${color}`} aria-hidden="true" />; }
function BrandMark() { return <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>; }
function Heading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) { return <div className="panel-heading"><div><span className="section-kicker">{eyebrow}</span><h3>{title}</h3></div>{action}</div>; }
function Toast({ notice }: { notice: Notice | null }) { return notice ? <div className={`notice-toast notice-${notice.tone}`} role="status"><Dot color={notice.tone === "info" ? "cyan" : "green"} />{notice.message}</div> : null; }

function Metric({ label, value, detail, tone = "cyan", children }: { label: string; value: string; detail: string; tone?: "cyan" | "blue" | "green" | "amber"; children?: ReactNode }) {
  return <article className={`metric-card metric-card-${tone}`} title={`${label}: ${detail}`}><div className="metric-card-heading"><span>{label}</span><span className="metric-mark">+</span></div><div className="metric-value-row"><strong>{value}</strong>{children}</div><p>{detail}</p></article>;
}

function GaitVisual({ data, large = false }: { data: Simulation; large?: boolean }) {
  const cycle = `${Math.round(data.phase * 100)}%`;
  return <><div className={`gait-visual ${large ? "gait-visual-large" : ""}`}><div className="grid-lines" /><div className="leg-column left-leg"><div className="leg-head">L</div><div className="leg-track"><span className="leg-fill" style={{ height: `${56 + data.leftLoad * .38}%` }} /></div><strong>{data.leftLoad}%</strong><small>LEFT LEG</small></div><div className="gait-center"><div className="gait-ring" style={{ transform: `rotate(${data.phase * 360}deg)` }}><span className="gait-crosshair" /><div style={{ transform: `rotate(-${data.phase * 360}deg)` }}><strong>{data.velocity.toFixed(2)}</strong><small>m/s</small></div></div><span>VELOCITY / SIMULATED</span></div><div className="leg-column right-leg"><div className="leg-head">R</div><div className="leg-track"><span className="leg-fill" style={{ height: `${56 + data.rightLoad * .38}%` }} /></div><strong>{data.rightLoad}%</strong><small>RIGHT LEG</small></div></div><div className="gait-cycle-row"><span>GAIT CYCLE</span><div className="gait-cycle-track"><span style={{ width: cycle }} /></div><strong>{cycle}</strong></div><div className="gait-footer"><div><span>STEP CADENCE</span><strong>{data.cadence} <small>SPM</small></strong><em>SIMULATED</em></div><div><span>STRIDE LENGTH</span><strong>{data.stride.toFixed(2)} <small>M</small></strong><em>SIMULATED</em></div><div><span>GROUND CONTACT</span><strong>{data.contact.toFixed(2)} <small>SEC</small></strong><em>SIMULATED</em></div></div></>;
}

function GaitPanel({ data, paused, onPause, large = false }: { data: Simulation; paused: boolean; onPause: () => void; large?: boolean }) {
  return <article className={`panel gait-panel ${large ? "gait-panel-large" : ""}`}><Heading eyebrow="REAL-TIME FEED / DEMO MODE" title={large ? "Live session" : "Live gait monitoring"} action={<div className="gait-panel-actions"><div className="live-indicator"><Dot color={paused ? "amber" : "green"} />{paused ? "PAUSED" : "LIVE"}</div><button className="pause-button" onClick={onPause}>{paused ? "RESUME" : "PAUSE"}</button></div>} /><GaitVisual data={data} large={large} /><div className="visual-legend"><span><i className="legend-cyan" /> LOAD DISTRIBUTION</span><span><i className="legend-blue" /> CYCLE PHASE</span><span className="last-updated">LAST UPDATED / SIMULATED</span></div></article>;
}

function Analysis({ data, full = false, onDetails }: { data: Simulation; full?: boolean; onDetails?: () => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const rows = [{ icon: "/", label: "Movement symmetry", detail: "Balanced loading, simulated", value: `${data.symmetry}`, suffix: "/ 100", progress: data.symmetry, color: "cyan" }, { icon: "~", label: "Step cadence", detail: "Within adaptive demo range", value: `${data.cadence}`, suffix: "SPM", progress: data.cadence - 20, color: "blue" }, { icon: "+", label: "Stability index", detail: "Consistent across demo cycle", value: "88", suffix: "/ 100", progress: 88, color: "green" }];
  return <article className={`panel analysis-panel ${full ? "analysis-panel-full" : ""}`}><Heading eyebrow="BIOMECHANICS / SIMULATED" title={full ? "Gait analysis trends" : "Gait analysis"} action={full ? <span className="range-active">LAST 30 MIN</span> : <button className="text-button" onClick={() => onDetails ? onDetails() : setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>{detailsOpen ? "HIDE DETAILS" : "DETAILS"} <span>-&gt;</span></button>} />{full ? <Trend /> : <div className="analysis-list">{rows.map((row) => <div className="analysis-item" key={row.label}><div className="analysis-row"><div className="analysis-icon">{row.icon}</div><div className="analysis-label"><strong>{row.label}</strong><span>{row.detail}</span></div><div className="analysis-number"><strong>{row.value}</strong><span>{row.suffix}</span></div></div><div className={`progress-line ${row.color}-line`}><span style={{ width: `${row.progress}%` }} /></div></div>)}</div>}{detailsOpen && !full && <div className="analysis-detail-copy">Detail view: simulated load distribution is currently balanced across the demo cycle.</div>}<div className="analysis-note"><span>i</span><p>All indicators are simulated for interface preview and are not medical measurements.</p></div></article>;
}

function Trend() { const series = [48, 52, 50, 61, 57, 66, 63, 73, 69, 76, 72, 81, 77, 86, 84, 91]; return <div className="trend-chart-wrap"><div className="chart-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="trend-chart">{series.map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }} />)}</div><div className="chart-labels"><span>09:00</span><span>09:10</span><span>09:20</span><span>09:30</span><span>NOW</span></div><div className="trend-legend"><span><i className="legend-cyan" /> SYMMETRY</span><span><i className="legend-blue" /> CADENCE</span><span><i className="legend-green" /> ASSISTANCE</span></div></div>; }

function Telemetry({ data }: { data: Simulation }) { return <article className="panel signal-panel"><Heading eyebrow="SIGNAL PULSE / LOCAL" title="Motion telemetry" action={<span className="live-indicator"><Dot /> 60 HZ</span>} /><div className="signal-chart" aria-label="Simulated live motion telemetry chart">{data.telemetry.map((height, index) => <span key={`${height}-${index}`} style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }} />)}</div><div className="signal-legend"><span><i className="legend-cyan" /> HIP ANGLE</span><span><i className="legend-blue" /> KNEE LOAD</span><span>LAST 30 SEC</span></div><div className="health-status"><div><Dot color="green" /><span><strong>Safety system</strong> nominal</span></div><div><Dot color="green" /><span><strong>Motor temperature</strong> 31.4 C</span></div></div></article>; }

function Controls({ mode, setMode, intensity, setIntensity, balance, setBalance, active, onSession, onReset, onNotice }: { mode: Mode; setMode: (mode: Mode) => void; intensity: number; setIntensity: (value: number) => void; balance: number; setBalance: (value: number) => void; active: boolean; onSession: () => void; onReset: () => void; onNotice: (message: string) => void }) {
  return <article className="panel controls-panel"><Heading eyebrow="EXOSUIT RESPONSE / LOCAL" title="Assistance controls" action={<span className="control-lock">UNLOCKED</span>} /><div className="control-group"><label htmlFor="mode">Assistance mode</label><select id="mode" value={mode} onChange={(event) => { const next = event.target.value as Mode; setMode(next); onNotice(`Assistance mode set to ${next}.`); }}><option>Adaptive</option><option>Training</option><option>Manual</option></select></div><div className="control-group"><div className="range-label"><label htmlFor="intensity">Assistance intensity</label><strong>{intensity}%</strong></div><input id="intensity" type="range" min="0" max="100" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} style={{ "--range-progress": `${intensity}%` } as CSSProperties} /><div className="range-scale"><span>MIN</span><span>MAX</span></div></div><div className="balance-controls"><div className="range-label"><label htmlFor="balance">Left / right balance</label><strong>{balance}% / {100 - balance}%</strong></div><div className="balance-row"><span>L</span><input id="balance" type="range" min="0" max="100" value={balance} onChange={(event) => setBalance(Number(event.target.value))} style={{ "--range-progress": `${balance}%` } as CSSProperties} /><span>R</span></div></div><div className="control-actions"><button className={`session-button ${active ? "end-session" : "start-session"}`} onClick={onSession}><span className="button-dot" /> {active ? "End session" : "Start session"}</button><button className="secondary-button" onClick={onReset}>Reset controls</button></div></article>;
}

function Sessions({ filterable, onNotice, onViewAll }: { filterable?: boolean; onNotice: (message: string) => void; onViewAll?: () => void }) { const [query, setQuery] = useState(""); const rows = sessions.filter((session) => `${session.date} ${session.mode} ${session.status}`.toLowerCase().includes(query.toLowerCase())); return <article className="panel sessions-panel"><div className="panel-heading"><div><span className="section-kicker">HISTORY / LOCAL SESSIONS</span><h3>{filterable ? "Session history" : "Recent sessions"}</h3></div>{filterable ? <input className="session-search" aria-label="Search sessions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions" /> : <button className="text-button" onClick={() => onViewAll ? onViewAll() : onNotice("Showing all local sessions in this view.")}>VIEW ALL <span>-&gt;</span></button>}</div>{rows.length ? <div className="table-wrap"><table><thead><tr><th>DATE &amp; TIME</th><th>STATUS</th><th>DURATION</th><th>STEPS</th><th>SYMMETRY</th><th>MODE</th><th aria-label="Open session" /></tr></thead><tbody>{rows.map((session) => <tr key={session.date}><td><strong>{session.date}</strong><span className="table-muted">Local session</span></td><td><span className={`status-pill ${session.status === "Completed" ? "status-complete" : "status-ended"}`}>{session.status}</span></td><td>{session.duration}</td><td>{session.steps}</td><td><span className="symmetry-pill">{session.symmetry}</span></td><td><span className="mode-pill">{session.mode}</span></td><td><button className="row-arrow" onClick={() => onNotice(`Session details opened for ${session.date}.`)} aria-label={`Open session from ${session.date}`}>-&gt;</button></td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>No matching sessions</strong><span>Try a different search term.</span></div>}</article>; }

type LiveTelemetryRecord = {
  id: number;
  timestamp: string | null;
  device_id: string;
  heel_fsr: number;
  toe_fsr: number;
  pitch: number;
  gyro_y: number;
  gait_state: string;
  servo_state: string;
  battery_voltage: number | null;
  fault_code: string;
};

function HardwareNodePanel({ telemetry, isLive }: { telemetry: LiveTelemetryRecord | null; isLive: boolean }) {
  if (!telemetry || !isLive) return null;

  return (
    <article className="panel hardware-node-panel" style={{ border: "1px solid rgba(16, 185, 129, 0.35)", background: "rgba(16, 185, 129, 0.03)" }}>
      <Heading
        eyebrow="ESP32 HARDWARE NODE / LIVE SENSOR TELEMETRY"
        title={`Connected Device: ${telemetry.device_id.toUpperCase()}`}
        action={
          <div className="live-indicator" style={{ color: "#10b981", fontWeight: 600 }}>
            <Dot color="green" /> STREAMING @ 20 HZ
          </div>
        }
      />
      <div className="metric-grid" style={{ marginTop: "1rem", marginBottom: "0" }}>
        <Metric label="HEEL FSR" value={`${Math.round(telemetry.heel_fsr)}`} detail="Raw pressure ADC (GPIO 32)" tone="cyan" />
        <Metric label="TOE FSR" value={`${Math.round(telemetry.toe_fsr)}`} detail="Raw pressure ADC (GPIO 33)" tone="cyan" />
        <Metric label="SHIN PITCH" value={`${telemetry.pitch > 0 ? "+" : ""}${telemetry.pitch.toFixed(1)}°`} detail="Tri-axial orientation" tone="blue" />
        <Metric label="GYROSCOPE Y" value={`${telemetry.gyro_y.toFixed(2)}`} detail="Angular velocity (deg/s)" tone="blue" />
        <Metric label="GAIT PHASE" value={telemetry.gait_state} detail="Edge-detected gait state" tone={telemetry.gait_state === "SWING" ? "green" : "cyan"} />
        <Metric label="SERVO RESPONSE" value={telemetry.servo_state} detail={telemetry.servo_state === "TENSION" ? "Cable tensioned (lifting foot)" : "Cable slack (ground contact)"} tone={telemetry.servo_state === "TENSION" ? "amber" : "green"} />
      </div>
    </article>
  );
}

function Settings({ onNotice, hardwareConnected, forceSimulation, onToggleSimulation }: { onNotice: (message: string) => void; hardwareConnected?: boolean; forceSimulation?: boolean; onToggleSimulation?: () => void }) {
  return (
    <>
      <div className="view-intro">
        <span className="section-kicker">SYSTEM CONFIGURATION / LOCAL</span>
        <h2>Settings</h2>
        <p>Configure telemetry sources and inspect connected hardware devices.</p>
      </div>
      <div className="settings-grid">
        <article className="panel settings-panel">
          <Heading eyebrow="TELEMETRY SOURCE" title="Data input configuration" />
          <div className="setting-row" onClick={onToggleSimulation} role="button" tabIndex={0} style={{ cursor: "pointer" }}>
            <div>
              <strong>{forceSimulation ? "Simulation mode enabled" : "Live hardware auto-detect"}</strong>
              <span>{hardwareConnected ? (forceSimulation ? "Hardware stream paused, using local simulation" : "Connected to ESP32 FastAPI stream") : "No live hardware detected, using local simulation"}</span>
            </div>
            <span className={`toggle ${!forceSimulation && hardwareConnected ? "is-on" : ""}`}><i /></span>
          </div>
          <Setting label="Compact telemetry" detail="Show denser signal traces" />
          <Setting label="Reduced motion" detail="Follow operating system preference" />
        </article>
        <article className="panel settings-panel">
          <Heading eyebrow="NOTIFICATIONS" title="Operator notifications" />
          <Setting label="Session events" detail="Start, pause, and end confirmations" on />
          <Setting label="Safety reminders" detail="Local demo status reminders" on />
          <button className="secondary-button settings-button" onClick={() => onNotice("Notification preferences saved locally.")}>Save preferences</button>
        </article>
        <article className="panel settings-panel">
          <Heading eyebrow="DEVICE INFORMATION" title="ESP32 DEV-NODE" />
          <div className="device-facts">
            <div><span>Firmware</span><strong>actigait_sensor_node v1.0</strong></div>
            <div><span>Connection</span><strong><Dot color={hardwareConnected && !forceSimulation ? "green" : "amber"} /> {hardwareConnected && !forceSimulation ? "Live 20Hz / FastApi" : "Simulation fallback"}</strong></div>
            <div><span>Safety state</span><strong><Dot color="green" /> Nominal</strong></div>
            <div><span>Data source</span><strong>{hardwareConnected && !forceSimulation ? "ESP32 Sensors" : "Local simulation"}</strong></div>
          </div>
        </article>
        <article className="panel settings-panel safety-panel">
          <Heading eyebrow="SAFETY INFORMATION" title="Designed for review" />
          <p>This prototype presents sensor telemetry for research and validation. It does not connect to a certified medical device or provide clinical diagnosis.</p>
          <span className="version-label">ACTIGAIT EXOSUIT / CONTROL CONSOLE / v2.4.1</span>
        </article>
      </div>
    </>
  );
}

function Setting({ label, detail, on = false }: { label: string; detail: string; on?: boolean }) { const [enabled, setEnabled] = useState(on); return <button className="setting-row" onClick={() => setEnabled((value) => !value)} aria-pressed={enabled}><div><strong>{label}</strong><span>{detail}</span></div><span className={`toggle ${enabled ? "is-on" : ""}`} aria-label={`${label} ${enabled ? "enabled" : "disabled"}`}><i /></span></button>; }

function OperatorPanel({ active, onClose, onLock, onNavigate, sessionActive }: { active: boolean; onClose: () => void; onLock: () => void; onNavigate: (view: ViewKey) => void; sessionActive: boolean }) {
  if (!active) return null;
  return <div className="operator-popover" role="dialog" aria-modal="false" aria-labelledby="operator-panel-title"><div className="operator-panel-header"><div><span className="section-kicker">OPERATOR CONSOLE / DEMO</span><h2 id="operator-panel-title">Operator profile</h2></div><button className="operator-close" onClick={onClose} aria-label="Close profile panel">x</button></div><div className="operator-identity"><div className="operator-avatar">DR</div><div><strong>Dr. Riley Morgan</strong><span>Clinical Operator</span><em>Fictional demo operator information</em></div></div><div className="operator-facts"><div><span>Operator ID</span><strong>OP-0418</strong></div><div><span>Connected device</span><strong>AG-X / 0418</strong></div><div><span>Current session</span><strong><Dot color={sessionActive ? "green" : "amber"} /> {sessionActive ? "Active / simulated" : "Standby"}</strong></div><div><span>Access level</span><strong>Clinical operator</strong></div><div><span>Calibration status</span><strong><Dot color="green" /> Ready / demo</strong></div><div><span>Simulation mode</span><strong>Local demo</strong></div><div><span>Console version</span><strong>OS 2.4.1</strong></div></div><div className="operator-actions"><button onClick={() => onNavigate("Settings")}>View operator profile <span>-&gt;</span></button><button onClick={() => onNavigate("Settings")}>Session preferences <span>-&gt;</span></button><button onClick={() => onNavigate("Settings")}>Safety information <span>-&gt;</span></button><button className="operator-lock" onClick={onLock}>Lock console <span>-&gt;</span></button></div></div>;
}

function LockedConsole({ onUnlock }: { onUnlock: () => void }) {
  return <main className="locked-console"><div className="locked-card"><div className="locked-mark"><BrandMark /></div><span className="section-kicker">ACTIGAIT EXOSUIT / LOCAL DEMO</span><h1>Console locked</h1><p>Operator access is paused locally. No credentials or backend authentication are used in this prototype.</p><div className="locked-status"><Dot color="amber" /> Session data retained locally</div><button className="session-button start-session" onClick={onUnlock}>Unlock demo console</button></div></main>;
}

export default function DashboardWorkspace() {
  const router = useRouter();
  const [view, setView] = useState<ViewKey>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [active, setActive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<Mode>("Adaptive");
  const [intensity, setIntensity] = useState(62);
  const [balance, setBalance] = useState(50);
  const [seconds, setSeconds] = useState(1104);
  const [lastUpdated, setLastUpdated] = useState("14:32:08");
  const [data, setData] = useState(initialSimulation);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [operatorName, setOperatorName] = useState("Operator");

  // Real Hardware Telemetry States
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetryRecord | null>(null);
  const [hardwareConnected, setHardwareConnected] = useState(false);
  const [forceSimulation, setForceSimulation] = useState(false);

  const notify = (message: string, tone: Notice["tone"] = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 2800);
  };

  useEffect(() => {
    let ignore = false;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        const payload = await response.json() as { user?: { fullName?: string; username?: string; email?: string } | null };
        const nextName = payload.user?.fullName?.trim() || payload.user?.username?.trim() || payload.user?.email?.trim() || "Operator";
        if (!ignore) setOperatorName(nextName);
      } catch {
        if (!ignore) setOperatorName("Operator");
      }
    }
    loadUser();
    return () => { ignore = true; };
  }, []);

  // Poll FastAPI telemetry through Next.js proxy
  useEffect(() => {
    let activePoll = true;

    const pollTelemetry = async () => {
      try {
        const response = await fetch("/api/telemetry");
        if (!response.ok) return;
        const result = await response.json();
        if (!activePoll) return;

        if (result.connected && result.latest) {
          const latest: LiveTelemetryRecord = result.latest;
          setLiveTelemetry(latest);
          setHardwareConnected(true);

          if (!forceSimulation) {
            const heel = latest.heel_fsr;
            const toe = latest.toe_fsr;
            const total = heel + toe;
            const leftCalc = total > 30 ? Math.min(95, Math.max(15, Math.round((heel / total) * 100))) : 50;
            const rightCalc = 100 - leftCalc;

            let trace: number[] = [];
            if (result.history && result.history.length > 0) {
              trace = result.history.map((h: LiveTelemetryRecord) => {
                return Math.min(100, Math.max(10, Math.round(50 + h.pitch * 1.5)));
              });
            }

            setData((prev) => ({
              ...prev,
              phase: latest.gait_state === "SWING" ? 0.75 : 0.25,
              leftLoad: leftCalc,
              rightLoad: rightCalc,
              symmetry: Math.max(70, 100 - Math.abs(leftCalc - 50) * 2),
              telemetry: trace.length >= 8 ? trace : prev.telemetry,
            }));
            setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
          }
        } else {
          setHardwareConnected(false);
        }
      } catch {
        if (activePoll) setHardwareConnected(false);
      }
    };

    pollTelemetry();
    const timer = window.setInterval(pollTelemetry, 500);
    return () => {
      activePoll = false;
      window.clearInterval(timer);
    };
  }, [forceSimulation]);

  useEffect(() => {
    const gaitButton = Array.from(document.querySelectorAll<HTMLButtonElement>(".nav-item")).find((button) => button.textContent?.includes("Gait analysis"));
    if (!gaitButton) return;
    const openAnalysisRoute = () => router.push("/dashboard/gait-analysis");
    gaitButton.addEventListener("click", openAnalysisRoute);
    return () => gaitButton.removeEventListener("click", openAnalysisRoute);
  }, [router]);

  // Fallback simulation timer when hardware is not streaming
  useEffect(() => {
    if (paused || !active) return;
    if (hardwareConnected && !forceSimulation) return; // Live hardware drives updates

    const timer = window.setInterval(() => {
      setData((current) => {
        const phase = (current.phase + .075) % 1;
        const wave = Math.sin(phase * Math.PI * 2);
        return {
          ...current,
          phase,
          velocity: 1.18 + wave * .04,
          cadence: Math.round(112 + wave * 3),
          stride: .68 + wave * .015,
          contact: .42 - wave * .01,
          symmetry: Math.round(94 + wave * 2),
          leftLoad: Math.round(50 + wave * 4),
          rightLoad: Math.round(50 - wave * 4),
          telemetry: [...current.telemetry.slice(-23), Math.round(62 + wave * 18 + Math.sin(phase * Math.PI * 4) * 8)]
        };
      });
      setSeconds((value) => value + 1);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1200);

    return () => window.clearInterval(timer);
  }, [active, paused, hardwareConnected, forceSimulation]);

  useEffect(() => {
    const notification = document.querySelector<HTMLButtonElement>(".notification-button");
    const notifyLocal = () => notify("No new local notifications.", "info");
    notification?.addEventListener("click", notifyLocal);
    const rangeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".range-selector button"));
    const selectRange = (event: Event) => {
      rangeButtons.forEach((button) => button.classList.remove("is-active"));
      (event.currentTarget as HTMLButtonElement).classList.add("is-active");
      notify(`${(event.currentTarget as HTMLButtonElement).innerText} range selected.`, "info");
    };
    rangeButtons.forEach((button) => button.addEventListener("click", selectRange));
    return () => {
      notification?.removeEventListener("click", notifyLocal);
      rangeButtons.forEach((button) => button.removeEventListener("click", selectRange));
    };
  }, [view]);

  const selectView = (next: ViewKey) => { setView(next); setMobileOpen(false); notify(`${next} view selected.`, "info"); };
  const toggleSession = () => {
    const next = !active;
    setActive(next);
    notify(next ? "Session started." : "Session ended.");
  };
  const reset = () => {
    setMode("Adaptive");
    setIntensity(62);
    setBalance(50);
    notify("Assistance controls reset to default.");
  };
  const togglePause = () => {
    setPaused((value) => !value);
    notify(paused ? "Telemetry resumed." : "Telemetry paused.", "info");
  };

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = String(seconds % 60).padStart(2, "0");
  const isHardwareStreaming = hardwareConnected && !forceSimulation;

  const controls = <Controls mode={mode} setMode={setMode} intensity={intensity} setIntensity={setIntensity} balance={balance} setBalance={setBalance} active={active} onSession={toggleSession} onReset={reset} onNotice={notify} />;

  const overview = (
    <>
      <section className="welcome-row">
        <div>
          <p className="section-kicker">MONDAY / SEPTEMBER 14, 2026</p>
          <h2>{operatorName.trim() ? `Welcome back, ${operatorName.trim()}` : "Welcome to ActiGait"}<span>.</span></h2>
          <p className="subtle-copy">
            {isHardwareStreaming
              ? "Live sensor acquisition active from ESP32 node."
              : "Adaptive assistance is responding to simulated movement intent."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {isHardwareStreaming ? (
            <div className="simulation-label" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)", color: "#10b981" }}>
              <span className="pulse-ring" style={{ background: "#10b981" }} /> LIVE HARDWARE STREAM <span className="simulation-divider" /> {liveTelemetry?.device_id.toUpperCase()}
            </div>
          ) : (
            <div className="simulation-label">
              <span className="pulse-ring" /> SIMULATION / DEMO MODE <span className="simulation-divider" /> LOCAL ONLY
            </div>
          )}
          {hardwareConnected && (
            <button
              className="secondary-button"
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", borderRadius: "999px" }}
              onClick={() => {
                const next = !forceSimulation;
                setForceSimulation(next);
                notify(next ? "Switched to local simulation mode." : "Streaming live ESP32 telemetry!", next ? "info" : "success");
              }}
            >
              {forceSimulation ? "Switch to Live Hardware" : "Switch to Simulation"}
            </button>
          )}
        </div>
      </section>

      {/* Real-time Hardware Node Status Banner when live */}
      <HardwareNodePanel telemetry={liveTelemetry} isLive={isHardwareStreaming} />

      <section className="system-summary">
        <div><Dot color="green" /><span><strong>System health</strong> Nominal</span></div>
        <div><Dot color={isHardwareStreaming ? "green" : "amber"} /><span><strong>Telemetry stream</strong> {isHardwareStreaming ? "Live 20Hz / FastApi" : "Simulation"}</span></div>
        <div><Dot /><span><strong>Assistance mode</strong> {mode}</span></div>
        <div><Dot color={active ? "green" : "amber"} /><span><strong>Session state</strong> {active ? "Recording" : "Standby"}</span></div>
      </section>

      <section className="metric-grid">
        <Metric
          label="BATTERY LEVEL"
          value={isHardwareStreaming && liveTelemetry?.battery_voltage ? `${liveTelemetry.battery_voltage.toFixed(1)}V` : "78%"}
          detail={isHardwareStreaming ? "2S LiPo supply voltage" : "Estimated 3h 42m remaining"}
        >
          <div className="battery-mini"><span /></div>
        </Metric>
        <Metric
          label={isHardwareStreaming ? "DETECTED GAIT" : "ASSISTANCE MODE"}
          value={isHardwareStreaming && liveTelemetry ? liveTelemetry.gait_state : mode}
          detail={isHardwareStreaming && liveTelemetry ? `Servo: ${liveTelemetry.servo_state}` : "Responding to movement intent"}
          tone={isHardwareStreaming && liveTelemetry?.gait_state === "SWING" ? "green" : "blue"}
        >
          <span className="metric-status"><Dot color={isHardwareStreaming ? "green" : "cyan"} /> {isHardwareStreaming ? "LIVE" : (active ? "ACTIVE" : "STANDBY")}</span>
        </Metric>
        <Metric label="SESSION DURATION" value={`${minutes}:${displaySeconds}`} detail="Elapsed session time" tone="green">
          <span className="metric-status"><Dot color={active ? "green" : "amber"} /> {active ? "RECORDING" : "STANDBY"}</span>
        </Metric>
        <Metric label="DEVICE HEALTH" value="98.4%" detail="No hardware faults detected" tone="amber">
          <span className="health-bars"><i /><i /><i /><i /><i /></span>
        </Metric>
      </section>

      <section className="live-grid">
        <GaitPanel data={data} paused={paused || !active} onPause={togglePause} />
        <Analysis data={data} />
      </section>

      <section className="control-grid">
        {controls}
        <Telemetry data={data} />
      </section>

      <Sessions onNotice={notify} />
    </>
  );

  let content: ReactNode = overview;

  if (view === "Live session") {
    content = (
      <>
        <div className="view-intro">
          <span className="section-kicker">LIVE SESSION / {isHardwareStreaming ? "HARDWARE TELEMETRY" : "SIMULATION"}</span>
          <h2>Movement session</h2>
          <p>{isHardwareStreaming ? "Monitoring real-time ESP32 gait telemetry and active cable response." : "Observe a controlled gait cycle and tune assistance response."}</p>
        </div>
        <HardwareNodePanel telemetry={liveTelemetry} isLive={isHardwareStreaming} />
        <section className="live-grid">
          <GaitPanel data={data} paused={paused || !active} onPause={togglePause} large />
          <Telemetry data={data} />
        </section>
        <section className="control-grid">
          {controls}
          <article className="panel device-status-panel">
            <Heading eyebrow="DEVICE STATUS" title={isHardwareStreaming ? "ESP32 Live Node" : "Exosuit state"} />
            <div className="status-stack">
              <div><span>Connection quality</span><strong><Dot color="green" /> {isHardwareStreaming ? "20 Hz Serial/Wi-Fi" : "Simulated"}</strong></div>
              <div><span>Motor temperature</span><strong>31.4 C / nominal</strong></div>
              <div><span>Battery reserve</span><strong>{isHardwareStreaming && liveTelemetry?.battery_voltage ? `${liveTelemetry.battery_voltage.toFixed(1)}V LiPo` : "78% / 3h 42m"}</strong></div>
              <div><span>Safety interlock</span><strong><Dot color="green" /> Ready</strong></div>
            </div>
            <div className="session-note">
              <Dot color={isHardwareStreaming ? "green" : "amber"} />
              <p>{isHardwareStreaming ? "Telemetry is being received live from the physical ActiGait sensor node." : "Demo values update locally and do not represent a connected medical device."}</p>
            </div>
          </article>
        </section>
      </>
    );
  } else if (view === "Gait analysis") {
    content = (
      <>
        <div className="view-intro">
          <span className="section-kicker">BIOMECHANICS / {isHardwareStreaming ? "LIVE SENSORS" : "SIMULATED TRENDS"}</span>
          <h2>Gait analysis</h2>
          <p>Compare gait signals, symmetry, and cadence trends.</p>
        </div>
        <div className="analysis-toolbar">
          <div className="range-selector">
            <button className="is-active">30 MIN</button>
            <button>2 HR</button>
            <button>SESSION</button>
          </div>
          <span className="simulation-label compact-label">
            <span className="pulse-ring" style={{ background: isHardwareStreaming ? "#10b981" : undefined }} /> {isHardwareStreaming ? "LIVE STREAM" : "SIMULATED VALUES"}
          </span>
        </div>
        <Analysis data={data} full />
        <div className="analysis-stat-grid">
          <Metric label="MOVEMENT SYMMETRY" value={`${data.symmetry}%`} detail="Current load balance" />
          <Metric label="STRIDE CONSISTENCY" value="92%" detail="Across the session window" tone="green" />
          <Metric label="ASSISTANCE INTENSITY" value={`${intensity}%`} detail="Current control setting" tone="blue" />
        </div>
      </>
    );
  } else if (view === "Session history") {
    content = (
      <>
        <div className="view-intro">
          <span className="section-kicker">HISTORY / SESSIONS</span>
          <h2>Session history</h2>
          <p>Review previous movement sessions and inspect their summaries.</p>
        </div>
        <Sessions filterable onNotice={notify} />
      </>
    );
  } else if (view === "Settings") {
    content = (
      <Settings
        onNotice={notify}
        hardwareConnected={hardwareConnected}
        forceSimulation={forceSimulation}
        onToggleSimulation={() => {
          const next = !forceSimulation;
          setForceSimulation(next);
          notify(next ? "Simulation mode forced." : "Live hardware auto-detect enabled.", "info");
        }}
      />
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-atmosphere" aria-hidden="true">
        <div className="atmosphere-grid" />
        <div className="atmosphere-scan" />
        <div className="exo-silhouette">
          <span className="exo-joint exo-hip" />
          <span className="exo-joint exo-knee" />
          <span className="exo-joint exo-ankle" />
          <span className="exo-line exo-thigh" />
          <span className="exo-line exo-shin" />
        </div>
        <span className="data-trace trace-one">HIP / 60HZ / 0.42</span>
        <span className="data-trace trace-two">KNEE LOAD / NOMINAL</span>
        <span className="data-trace trace-three">AG-X // 0418</span>
      </div>

      <motion.aside
        className={`dashboard-sidebar ${mobileOpen ? "is-open" : ""}`}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .55, ease: "easeOut" }}
      >
        <div className="sidebar-topline">
          <div className="brand-lockup">
            <BrandMark />
            <div>
              <strong>ACTIGAIT</strong>
              <span>EXOSUIT / OS 2.4</span>
            </div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">x</button>
        </div>

        <div className="device-switcher">
          <div className="device-orb" style={{ borderColor: isHardwareStreaming ? "#10b981" : undefined }}>
            <span>{isHardwareStreaming ? "HW" : "AG"}</span>
          </div>
          <div>
            <span className="eyebrow">{isHardwareStreaming ? "CONNECTED HARDWARE" : "SIMULATED DEVICE"}</span>
            <strong>{isHardwareStreaming ? (liveTelemetry?.device_id.toUpperCase() || "ESP32-NODE") : "AG-X / 0418"}</strong>
          </div>
          <span className="device-chevron">v</span>
        </div>

        <nav className="side-nav" aria-label="Dashboard navigation">
          <span className="nav-label">WORKSPACE</span>
          {navigation.map(([label, icon]) => (
            <button
              className={`nav-item ${view === label ? "is-active" : ""}`}
              key={label}
              onClick={() => selectView(label)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {label === "Live session" && <span className="nav-live">LIVE</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="safety-callout">
            <Dot color="green" />
            <div>
              <strong>Safety system ready</strong>
              <span>{isHardwareStreaming ? "All hardware checks nominal" : "All checks nominal / demo"}</span>
            </div>
          </div>
          <div className="user-row">
            <div className="avatar">{operatorName.trim().slice(0, 2).toUpperCase() || "DR"}</div>
            <div>
              <strong>{operatorName.trim() || "Operator"}</strong>
              <span>Authenticated console</span>
            </div>
            <button
              className="more-dots"
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/");
                router.refresh();
              }}
            >
              LOG OUT
            </button>
          </div>
        </div>
      </motion.aside>

      {mobileOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <section className="dashboard-content">
        <header className="dashboard-header">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <span /><span /><span />
          </button>
          <div>
            <span className="eyebrow">MONITORING CONSOLE / {view.toUpperCase()}</span>
            <h1>Control center</h1>
          </div>
          <div className="header-actions">
            <div className="header-status">
              <Dot color={isHardwareStreaming ? "green" : "amber"} />
              <span>{isHardwareStreaming ? "Live ESP32 Node (20 Hz)" : "Device simulated"}</span>
              <small>{lastUpdated}</small>
            </div>
            <button className="notification-button" aria-label="Notifications">!</button>
          </div>
        </header>

        <motion.div
          className="dashboard-inner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, delay: .08, ease: "easeOut" }}
        >
          <Toast notice={notice} />
          {content}
          <footer className="dashboard-footer">
            <span>ACTIGAIT EXOSUIT / CONTROL CONSOLE</span>
            <span>
              {isHardwareStreaming ? "HARDWARE TELEMETRY ACTIVE" : "SIMULATION MODE"}{" "}
              <Dot color={isHardwareStreaming ? "green" : "amber"} /> v2.4.1
            </span>
          </footer>
        </motion.div>
      </section>
    </main>
  );
}

