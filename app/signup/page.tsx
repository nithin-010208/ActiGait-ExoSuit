"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState, type ChangeEvent, type FormEvent } from "react";

const initialState = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  deviceCode: "",
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to create the account.");
      }

      setSuccess("Account created successfully. Redirecting to your console...");
      router.push(next);
      router.refresh();
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create an account right now.");
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
          <span className="auth-kicker">AUTHENTICATION / CREATE PROFILE</span>
          <h1>Create your ActiGait workspace.</h1>
          <p>Set up your profile to access the exosuit control center and gait-analysis workspace.</p>
        </div>

        <form className="auth-form auth-form-grid" onSubmit={handleSubmit} noValidate>
          <label className="auth-field auth-field-wide">
            <span>Full name</span>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Riley Morgan"
              autoComplete="name"
              required
            />
          </label>

          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="riley.actigait"
              autoComplete="username"
              required
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="riley@actigait.local"
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="auth-field auth-field-wide">
            <span>Device / session code <em>optional</em></span>
            <input
              type="text"
              name="deviceCode"
              value={form.deviceCode}
              onChange={handleChange}
              placeholder="AG-X / 0418"
            />
          </label>

          {error ? <div className="auth-message auth-message-error" role="alert">{error}</div> : null}
          {success ? <div className="auth-message auth-message-success" role="status">{success}</div> : null}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer-row">
          <span>Already have access?</span>
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Log in</Link>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={<main className="auth-shell"><div className="auth-backdrop" aria-hidden="true" /><div className="auth-panel"><span className="auth-kicker">AUTHENTICATION / SECURE ACCESS</span><h1>Loading account setup...</h1></div></main>}><SignUpForm /></Suspense>;
}
