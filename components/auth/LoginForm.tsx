"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Mail, MailCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { invalidatePremium } from "@/lib/entitlement";

type Mode = "signin" | "signup";
type Method = "password" | "code";
type View = "form" | "code-sent" | "check-inbox" | "forgot" | "reset-sent";

const MIN_PASSWORD = 8;
const RESEND_SECONDS = 30;

/** Supabase error strings -> copy a person can act on. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Try again, or sign in with an emailed code.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("token has expired") || (m.includes("invalid") && m.includes("otp"))) return "That code is wrong or has expired. Request a new one.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("password should be")) return `Use at least ${MIN_PASSWORD} characters for your password.`;
  return message;
}

export default function LoginForm({ next, notice }: { next: string; notice: string | null }) {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [mode, setMode] = useState<Mode>("signin");
  const [method, setMethod] = useState<Method>("password");
  const [view, setView] = useState<View>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callback = (to: string) => `${origin}/auth/callback?next=${encodeURIComponent(to)}`;

  const done = () => {
    invalidatePremium();
    router.replace(next);
    router.refresh();
  };

  const run = async (fn: () => Promise<void>) => {
    if (!supabase) return setError("Sign-in isn't set up yet. Please try again soon.");
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(friendly(e instanceof Error ? e.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (mode === "signin") {
        const { error: err } = await supabase!.auth.signInWithPassword({ email, password });
        if (err) throw err;
        return done();
      }
      if (password.length < MIN_PASSWORD) throw new Error(`Password should be at least ${MIN_PASSWORD} characters.`);
      const { data, error: err } = await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: callback(next) } });
      if (err) throw err;
      // With email confirmation on, there's no session until the link is clicked.
      // (For an already-registered address Supabase deliberately looks the same.)
      if (data.session) return done();
      setView("check-inbox");
    });
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    void run(async () => {
      const { error: err } = await supabase!.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: callback(next) } });
      if (err) throw err;
      setCode("");
      setView("code-sent");
      setCooldown(RESEND_SECONDS);
    });
  };

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error: err } = await supabase!.auth.verifyOtp({ email, token: code.trim(), type: "email" });
      if (err) throw err;
      done();
    });
  };

  const sendReset = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error: err } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: callback("/account?reset=1") });
      if (err) throw err;
      setView("reset-sent");
    });
  };

  const back = () => {
    setView("form");
    setError(null);
  };

  const emailField = (
    <label className="auth-field">
      <span>Email</span>
      <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} required autoFocus placeholder="you@example.com" />
    </label>
  );

  let body: React.ReactNode;
  if (view === "code-sent") {
    body = (
      <form className="auth-form" onSubmit={verifyCode}>
        <p className="auth-note">
          We sent a code to <b>{email}</b>. It expires in a few minutes.
        </p>
        <label className="auth-field">
          <span>Code</span>
          <input
            className="auth-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
            autoFocus
            placeholder="••••••"
          />
        </label>
        {error ? <p className="auth-msg error" role="alert">{error}</p> : null}
        <button className="auth-btn primary" disabled={busy || code.length < 6}>{busy ? "Checking…" : "Continue"}</button>
        <div className="auth-links">
          <button type="button" className="auth-link" onClick={() => sendCode()} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <button type="button" className="auth-link" onClick={back}>Use a different email</button>
        </div>
      </form>
    );
  } else if (view === "check-inbox" || view === "reset-sent") {
    body = (
      <div className="auth-form">
        <div className="auth-done-ic"><MailCheck size={22} /></div>
        <p className="auth-note center">
          {view === "check-inbox" ? (
            <>We sent a confirmation link to <b>{email}</b>. Open it to activate your account.</>
          ) : (
            <>If an account exists for <b>{email}</b>, a password reset link is on its way.</>
          )}
        </p>
        <p className="auth-note center small">Nothing arrived? Check spam, or sign in with an emailed code instead.</p>
        <button type="button" className="auth-btn ghost" onClick={back}><ArrowLeft size={15} /> Back</button>
      </div>
    );
  } else if (view === "forgot") {
    body = (
      <form className="auth-form" onSubmit={sendReset}>
        <p className="auth-note">Enter your email and we'll send a link to set a new password.</p>
        {emailField}
        {error ? <p className="auth-msg error" role="alert">{error}</p> : null}
        <button className="auth-btn primary" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
        <div className="auth-links">
          <button type="button" className="auth-link" onClick={back}><ArrowLeft size={13} /> Back to sign in</button>
        </div>
      </form>
    );
  } else {
    body = (
      <>
        <div className="auth-seg" role="tablist" aria-label="Sign in method">
          <button role="tab" aria-selected={method === "password"} className={method === "password" ? "on" : ""} onClick={() => { setMethod("password"); setError(null); }}>
            <KeyRound size={14} /> Password
          </button>
          <button role="tab" aria-selected={method === "code"} className={method === "code" ? "on" : ""} onClick={() => { setMethod("code"); setError(null); }}>
            <Mail size={14} /> Email code
          </button>
        </div>
        {method === "password" ? (
          <form className="auth-form" onSubmit={submitPassword}>
            {emailField}
            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={mode === "signup" ? MIN_PASSWORD : undefined}
                required
              />
              {mode === "signup" ? <small>At least {MIN_PASSWORD} characters.</small> : null}
            </label>
            {error ? <p className="auth-msg error" role="alert">{error}</p> : null}
            <button className="auth-btn primary" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            {mode === "signin" ? (
              <div className="auth-links">
                <button type="button" className="auth-link" onClick={() => { setView("forgot"); setError(null); }}>Forgot password?</button>
              </div>
            ) : null}
          </form>
        ) : (
          <form className="auth-form" onSubmit={sendCode}>
            {emailField}
            <p className="auth-note small">We'll email you a one-time code. No password needed{mode === "signup" ? ", and your account is created automatically" : ""}.</p>
            {error ? <p className="auth-msg error" role="alert">{error}</p> : null}
            <button className="auth-btn primary" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
          </form>
        )}
      </>
    );
  }

  return (
    <div className="auth-wrap narrow">
      <header className="auth-head">
        <h1 className="auth-title">{view === "forgot" || view === "reset-sent" ? "Reset your password" : mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-sub">
          {mode === "signin" ? "Sign in to access Premium and your purchases." : "Your purchases are linked to this email."}
        </p>
      </header>

      {notice ? <p className="auth-msg info">{notice}</p> : null}
      {!supabase ? <p className="auth-msg error">Sign-in is temporarily unavailable.</p> : null}

      <section className="auth-card">
        {view === "form" ? (
          <div className="auth-tabs" role="tablist" aria-label="Account">
            <button role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "on" : ""} onClick={() => { setMode("signin"); setError(null); }}>Sign in</button>
            <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setError(null); }}>Create account</button>
          </div>
        ) : null}
        {body}
      </section>

      <p className="auth-foot">
        The editor is free without an account. By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}
