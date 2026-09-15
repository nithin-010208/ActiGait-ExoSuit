"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

type SessionStatus = "idle" | "running" | "paused" | "stopped";
type RangeKey = "30 seconds" | "5 minutes" | "15 minutes";
type Mode = "Adaptive" | "Training" | "Manual";

type DemoSession = {
  id: string;
  label: string;
  cadence: number;
  speed: number;
  strideTime: number;
  stepLength: number;
  symmetry: number;
  duration: string;
  mode: Mode;
};

const demoSessions: DemoSession[] = [
  { id: "demo-01", label: "Today / 09:42", cadence: 112, speed: 1.24, strideTime: 1.07, stepLength: 0.68, symmetry: 94, duration: "18m 24s", mode: "Adaptive" },
  { id: "demo-02", label: "Yesterday / 16:18", cadence: 108, speed: 1.12, strideTime: 1.11, stepLength: 0.64, symmetry: 91, duration: "24m 07s", mode: "Training" },
  { id: "demo-03", label: "Sep 12 / 14:32", cadence: 104, speed: 1.04, strideTime: 1.16, stepLength: 0.60, symmetry: 87, duration: "08m 15s", mode: "Manual" },
];

const rangeValues: Record<RangeKey, number[]> = {
  "30 seconds": [108, 110, 109, 113, 112, 114, 111, 115, 113, 112, 116, 114],
  "5 minutes": [102, 104, 106, 105, 108, 107, 109, 111, 110, 112, 111, 114, 113, 115, 114, 112],
  "15 minutes": [96, 99, 101, 100, 104, 103, 106, 105, 108, 107, 110, 109, 112, 111, 114, 113, 116, 114],
};

function Dot({ color = "cyan" }: { color?: "cyan" | "green" | "amber" }) {
  return <span className={`status-dot status-dot-${color}`} aria-hidden="true" />;
}

function BrandMark() {
  return <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>;
}

function Heading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-heading"><div><span className="section-kicker">{eyebrow}</span><h3>{title}</h3></div>{action}</div>;
}

function Metric({ label, value, unit, detail, tone = "cyan" }: { label: string; value: string; unit?: string; detail: string; tone?: "cyan" | "blue" | "green" | "amber" }) {
  return <article className={`metric-card metric-card-${tone}`}><div className="metric-card-heading"><span>{label}</span><span className="metric-mark">+</span></div><div className="metric-value-row"><strong>{value}</strong>{unit && <small className="analysis-unit">{unit}</small>}</div><p>{detail}</p></article>;
}

function CadenceChart({ values, range }: { values: number[]; range: RangeKey }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - ((value - 90) / 30) * 100}`).join(" ");
  return <div className="cadence-chart-shell"><div className="chart-y-axis"><span>120</span><span>110</span><span>100</span><span>90</span></div><div className="cadence-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Simulated cadence chart for ${range}. Values range from ${Math.min(...values)} to ${Math.max(...values)} steps per minute.`}><polygon className="chart-area" points={`0,100 ${points} 100,100`} /><polyline className="chart-line" points={points} /><line className="chart-baseline" x1="0" x2="100" y1="33" y2="33" /></svg>{values.map((value, index) => <span className="chart-point" key={`${value}-${index}`} style={{ left: `${(index / (values.length - 1)) * 100}%`, bottom: `${((value - 90) / 30) * 100}%` }} title={`${value} SPM`} />)}</div><div className="chart-x-axis"><span>START</span><span>MIDPOINT</span><span>NOW</span></div><p className="chart-summary">Simulated cadence ranged from {Math.min(...values)} to {Math.max(...values)} steps per minute in this demo window.</p></div>;
}

function SymmetryPanel({ symmetry }: { symmetry: number }) {
  const left = Math.round(symmetry / 2 + 3);
  const right = 100 - left;
  return <article className="panel symmetry-panel"><Heading eyebrow="LOAD DISTRIBUTION / SIMULATED" title="Movement symmetry" action={<span className="live-indicator"><Dot color="green" /> BALANCED</span>} /><div className="symmetry-hero"><div><strong>{left}%</strong><span>LEFT LEG</span></div><div className="symmetry-balance"><div className="symmetry-track"><span style={{ width: `${left}%` }} /><span style={{ width: `${right}%` }} /></div><div className="symmetry-center"><i /> CENTERLINE</div></div><div className="symmetry-right"><strong>{right}%</strong><span>RIGHT LEG</span></div></div><p className="neutral-interpretation"><Dot color="green" /> Simulated loading is currently balanced.</p><div className="analysis-note"><span>i</span><p>This comparison is local demo data and does not indicate clinical symmetry or diagnosis.</p></div></article>;
}

function CyclePanel({ phase, status, onPause }: { phase: number; status: SessionStatus; onPause: () => void }) {
  const phaseNames = ["Heel strike", "Foot flat", "Mid-stance", "Toe-off", "Swing phase"];
  const currentIndex = Math.min(4, Math.floor(phase * 5));
  return <article className="panel cycle-panel"><Heading eyebrow="MOVEMENT MODEL / SIMULATED" title="Gait cycle" action={<button className="pause-button" onClick={onPause}>{status === "paused" ? "RESUME" : "PAUSE"}</button>} /><div className="cycle-visual"><div className="cycle-orbit"><span className="cycle-marker" style={{ transform: `rotate(${phase * 360}deg) translateX(84px)` }} /><div className="cycle-core"><strong>{Math.round(phase * 100)}%</strong><span>{status === "running" ? "CYCLE POSITION" : status.toUpperCase()}</span></div></div></div><div className="cycle-phases">{phaseNames.map((name, index) => <div className={index === currentIndex ? "is-current" : ""} key={name}><span>{String(index + 1).padStart(2, "0")}</span><strong>{name}</strong><i /></div>)}</div><div className="leg-timing"><span><i className="legend-cyan" /> LEFT LEG / TIMED</span><span><i className="legend-blue" /> RIGHT LEG / TIMED</span></div></article>;
}

function AssistancePanel({ mode, intensity }: { mode: Mode; intensity: number }) {
  const trend = [35, 41, 38, 49, 46, 55, 52, 61, 58, Math.min(92, intensity)];
  return <article className="panel assistance-panel"><Heading eyebrow="EXOSUIT RESPONSE / SIMULATED" title="Assistance response" action={<span className="mode-pill">{mode}</span>} /><div className="assistance-current"><div><span>CURRENT INTENSITY</span><strong>{intensity}%</strong></div><div><span>MODE</span><strong>{mode}</strong></div></div><div className="assistance-bars" aria-label="Simulated assistance intensity trend">{trend.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><div className="assistance-axis"><span>START</span><span>NOW</span></div><p className="subtle-copy">The response model represents how assistance could adapt to simulated gait stability and operator settings.</p><div className="assistance-foot"><Dot color="green" /> Response model active / no device connection</div></article>;
}

function Interpretation({ symmetry, status }: { symmetry: number; status: SessionStatus }) {
  const state = status === "running" ? "Monitoring" : status === "paused" ? "Paused" : status === "stopped" ? "Stopped" : "Ready";
  return <article className="panel interpretation-panel"><Heading eyebrow="OPERATOR SUMMARY / SIMULATED" title="Clinical interpretation" action={<span className="range-active">DEMO ONLY</span>} /><div className="interpretation-grid"><div><span>OVERALL GAIT STATUS</span><strong><Dot color="green" /> Stable / simulated</strong></div><div><span>ASYMMETRY DETECTION</span><strong>{symmetry >= 90 ? "No notable imbalance" : "Mild simulated variance"}</strong></div><div><span>SUGGESTED ASSISTANCE</span><strong>{symmetry >= 92 ? "Maintain current level" : "Review assistance setting"}</strong></div><div><span>SESSION QUALITY</span><strong>{state} / local model</strong></div></div><div className="analysis-note"><span>i</span><p>These observations are generated from mock data for interface demonstration. They are not clinical findings or treatment guidance.</p></div></article>;
}

function Sidebar({ router }: { router: ReturnType<typeof useRouter> }) {
  const go = (label: string) => { if (label === "Gait Analysis") return; router.push("/dashboard"); };
  return <aside className="dashboard-sidebar"><div className="sidebar-topline"><div className="brand-lockup"><BrandMark /><div><strong>ACTIGAIT</strong><span>EXOSUIT / OS 2.4</span></div></div></div><div className="device-switcher"><div className="device-orb"><span>AG</span></div><div><span className="eyebrow">SIMULATED DEVICE</span><strong>AG-X / 0418</strong></div><span className="device-chevron">v</span></div><nav className="side-nav" aria-label="Dashboard navigation"><span className="nav-label">WORKSPACE</span>{[["Overview", "OV"], ["Live session", "LS"], ["Gait Analysis", "GA"], ["Session history", "SH"], ["Settings", "ST"]].map(([label, icon]) => <button className={`nav-item ${label === "Gait Analysis" ? "is-active" : ""}`} key={label} onClick={() => go(label)}><span className="nav-icon">{icon}</span><span>{label}</span>{label === "Live session" && <span className="nav-live">LIVE</span>}</button>)}</nav><div className="sidebar-bottom"><div className="safety-callout"><Dot color="green" /><div><strong>Safety system ready</strong><span>All checks nominal / demo</span></div></div><div className="user-row"><div className="avatar">DR</div><div><strong>Dr. Riley Morgan</strong><span>Clinical operator</span></div><span className="more-dots">...</span></div></div></aside>;
}

export default function GaitAnalysisPage() {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("5 minutes");
  const [selectedId, setSelectedId] = useState(demoSessions[0].id);
  const [mode, setMode] = useState<Mode>("Adaptive");
  const [intensity, setIntensity] = useState(38);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [phase, setPhase] = useState(0.18);
  const [message, setMessage] = useState("");
  const selected = demoSessions.find((session) => session.id === selectedId) ?? demoSessions[0];
  const values = rangeValues[range];
  const minutes = status === "running" ? "04:18" : status === "paused" ? "04:18" : "00:00";

  const notify = (next: string) => { setMessage(next); window.setTimeout(() => setMessage(""), 2600); };
  useEffect(() => { if (status !== "running") return; const timer = window.setInterval(() => setPhase((current) => (current + 0.025) % 1), 900); return () => window.clearInterval(timer); }, [status]);
  const start = () => { setStatus("running"); notify("Simulation started locally."); };
  const pause = () => { if (status === "running") { setStatus("paused"); notify("Simulation paused."); } else if (status === "paused") { setStatus("running"); notify("Simulation resumed."); } };
  const stop = () => { setStatus("stopped"); notify("Session stopped. Demo data retained locally."); };
  const reset = () => { setStatus("idle"); setPhase(0.18); setRange("5 minutes"); setSelectedId(demoSessions[0].id); setMode("Adaptive"); setIntensity(38); notify("Analysis reset to initial values."); };
  const exportReport = () => { const csv = ["metric,value,unit,source", `Cadence,112,steps/min,simulated`, `Walking speed,1.24,m/s,simulated`, `Stride time,1.07,s,simulated`, `Step length,0.68,m,simulated`, `Gait symmetry,94,percent,simulated`, `Assistance level,${intensity},percent,simulated`].join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "actigait-gait-analysis-demo.csv"; link.click(); URL.revokeObjectURL(link.href); notify("Demo report exported locally."); };
  const statusLabel = status === "running" ? "RUNNING" : status === "paused" ? "PAUSED" : status === "stopped" ? "STOPPED" : "READY";
  const actionStyle = { "--range-progress": `${intensity}%` } as CSSProperties;

  return <main className="dashboard-shell gait-analysis-shell"><Sidebar router={router} /><section className="dashboard-content"><header className="dashboard-header"><div><span className="eyebrow">MONITORING CONSOLE / GAIT ANALYSIS</span><h1>Gait Analysis</h1></div><div className="header-actions"><div className="header-status"><Dot color={status === "running" ? "green" : "amber"} /><span>{status === "running" ? "Session active / simulated" : "Device connected / simulated"}</span><small>{statusLabel}</small></div><span className="simulation-label"><span className="pulse-ring" /> SIMULATED DATA</span></div></header><div className="dashboard-inner">{message && <div className="notice-toast notice-info" role="status"><Dot />{message}</div>}<section className="analysis-hero"><div><span className="section-kicker">MEASURE / UNDERSTAND / ADAPT</span><h2>Gait Analysis</h2><p>Patient demo / AG-X-0418 <span className="hero-divider" /> Review controlled movement signals using local simulated data.</p></div><div className="analysis-disclaimer"><Dot color="amber" /><span>SIMULATED DATA<br /><strong>NO CLINICAL INTERPRETATION</strong></span></div></section><section className="session-control-bar"><div className="session-identity"><span className="eyebrow">SESSION / DEMO-0418</span><strong>Riley Morgan / Assisted walk</strong><span>Local session timer: {minutes}</span></div><div className="session-actions"><button className="session-button start-session" onClick={start} disabled={status === "running"}><span className="button-dot" /> START SESSION</button><button className="session-button pause-session" onClick={pause} disabled={status !== "running" && status !== "paused"}>{status === "paused" ? "RESUME" : "PAUSE"}</button><button className="session-button stop-session" onClick={stop} disabled={status === "idle" || status === "stopped"}>STOP</button><button className="secondary-button" onClick={reset}>RESET</button></div></section><section className="analysis-toolbar"><div className="range-selector" role="group" aria-label="Analysis time range">{(Object.keys(rangeValues) as RangeKey[]).map((option) => <button className={range === option ? "is-active" : ""} key={option} onClick={() => { setRange(option); notify(`${option} range selected.`); }}>{option}</button>)}</div><label className="session-select-label">DEMO SESSION<select value={selectedId} onChange={(event) => { const next = demoSessions.find((session) => session.id === event.target.value) ?? demoSessions[0]; setSelectedId(next.id); setMode(next.mode); notify(`${next.label} selected.`); }}>{demoSessions.map((session) => <option key={session.id} value={session.id}>{session.label} / {session.mode}</option>)}</select></label></section><section className="metric-grid analysis-metrics"><Metric label="CADENCE" value="112" unit="STEPS/MIN" detail="Simulated current session" /><Metric label="WALKING SPEED" value="1.24" unit="M/S" detail="Local demo signal" tone="blue" /><Metric label="STRIDE TIME" value="1.07" unit="S" detail="Simulated timing" tone="green" /><Metric label="STEP LENGTH" value="0.68" unit="M" detail="Simulated distance" tone="amber" /><Metric label="GAIT SYMMETRY" value="94" unit="%" detail="Neutral load comparison" tone="blue" /><Metric label="ASSISTANCE LEVEL" value={`${intensity}`} unit="%" detail="Current response setting" tone="green" /></section><section className="analysis-main-grid"><article className="panel cadence-panel"><Heading eyebrow="CADENCE TRACE / SIMULATED" title="Cadence over time" action={<span className="chart-unit">STEPS/MIN</span>} /><CadenceChart values={values} range={range} /></article><SymmetryPanel symmetry={94} /></section><section className="analysis-main-grid"><CyclePanel phase={phase} status={status} onPause={pause} /><AssistancePanel mode={mode} intensity={intensity} /></section><section className="analysis-controls panel"><div><span className="section-kicker">RESPONSE MODEL / LOCAL</span><h3>Assistance tuning</h3></div><label>Mode<select value={mode} onChange={(event) => { setMode(event.target.value as Mode); notify(`Assistance mode set to ${event.target.value}.`); }}><option>Adaptive</option><option>Training</option><option>Manual</option></select></label><label>Intensity <strong>{intensity}%</strong><input type="range" min="0" max="100" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} style={actionStyle} /></label><button className="secondary-button" onClick={reset}>Reset analysis</button><button className="session-button start-session" onClick={exportReport}>Export demo report</button></section><Interpretation symmetry={94} status={status} /><footer className="dashboard-footer"><span>ACTIGAIT EXOSUIT / GAIT ANALYSIS</span><span>SIMULATION MODE <Dot color="amber" /> v2.4.1</span></footer></div></section></main>;
}
