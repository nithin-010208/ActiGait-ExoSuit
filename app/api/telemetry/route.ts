import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    // Fetch latest telemetry and history from FastAPI
    const [latestRes, historyRes] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/latest`, {
        signal: controller.signal,
        cache: "no-store",
      }),
      fetch(`${BACKEND_URL}/history?limit=24`, {
        signal: controller.signal,
        cache: "no-store",
      }),
    ]);

    clearTimeout(timeoutId);

    if (latestRes.status !== "fulfilled" || !latestRes.value.ok) {
      return NextResponse.json({
        connected: false,
        source: "simulation_fallback",
        message: "FastAPI backend reachable, but no telemetry records present or backend offline.",
      });
    }

    const latest = await latestRes.value.json();
    let history = [];
    if (historyRes.status === "fulfilled" && historyRes.value.ok) {
      history = await historyRes.value.json();
    }

    return NextResponse.json({
      connected: true,
      source: "hardware_backend",
      latest,
      history,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      source: "simulation_fallback",
      error: error instanceof Error ? error.message : "Failed to reach backend",
    });
  }
}
