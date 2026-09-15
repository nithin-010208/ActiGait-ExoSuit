"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState, type FormEvent } from "react";

const initialState = { identifier: "", password: "" };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Login failed.");
      }

      router.push(next);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-panel auth-panel-large">
        <div className="auth-brand-row">
          <Link href="/" className="auth-brand" aria-label="Return to ActiGait homepage">
            <span className="home-brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>
              <strong>ACTIGAIT</strong>
              <small>EXOSUIT / OS 2.4</small>
            </span>
          </Link>
          <Link href="/" className="auth-mini-link">Back to home</Link>
        </div>

        <div className="auth-header">
          <span className="auth-kicker">AUTHENTICATION / SECURE ACCESS</span>
          <h1>Welcome back to ActiGait.</h1>
          <p>Sign in to continue to your control center.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Username or email</span>
            <input
              type="text"
              name="identifier"
              autoComplete="username"
              value={form.identifier}
              onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
              placeholder="operator or name@actigait.local"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              required
            />
          </label>

          {error ? <div className="auth-message auth-message-error" role="alert">{error}</div> : null}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="auth-footer-row">
          <span>New here?</span>
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>Create account</Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="auth-shell"><div className="auth-backdrop" aria-hidden="true" /><div className="auth-panel"><span className="auth-kicker">AUTHENTICATION / SECURE ACCESS</span><h1>Loading secure access...</h1></div></main>}><LoginForm /></Suspense>;
}
