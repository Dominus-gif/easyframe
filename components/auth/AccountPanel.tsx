"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, KeyRound, LogOut, Receipt } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { signOutApp } from "@/lib/auth/client";

type Props = {
  email: string;
  /** `renews` is already formatted on the server — never re-format dates here. */
  plan: { premium: boolean; label: string; renews: string | null };
  purchases: { id: string; type: string; date: string; dateLabel: string }[];
  /** False when the plan/purchase lookup failed — never show "Free" on a guess. */
  planKnown?: boolean;
  /** Arrived from a password-reset email: open straight onto "set new password". */
  resetMode: boolean;
};

const MIN_PASSWORD = 8;

const eventLabel = (type: string) =>
  type
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function AccountPanel({ email, plan, purchases, resetMode, planKnown = true }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; message?: string }>({ kind: "idle" });

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setStatus({ kind: "error", message: `Use at least ${MIN_PASSWORD} characters.` });
    if (password !== confirm) return setStatus({ kind: "error", message: "Passwords don't match." });
    const supabase = getBrowserSupabase();
    if (!supabase) return setStatus({ kind: "error", message: "Sign-in isn't configured yet." });
    setStatus({ kind: "busy" });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setStatus({ kind: "error", message: error.message });
    setPassword("");
    setConfirm("");
    setStatus({ kind: "ok", message: "Password updated. Use it next time you sign in." });
  };

  return (
    <div className="auth-wrap">
      <header className="auth-head">
        <span className="mk-kicker">Account</span>
        <h1 className="auth-title">Your account</h1>
        <p className="auth-sub">{email}</p>
      </header>

      <section className="auth-card">
        <div className="auth-row">
          <div className={`auth-plan-ic ${plan.premium ? "on" : ""}`}>
            <Crown size={18} />
          </div>
          <div className="auth-row-main">
            <strong>{planKnown ? plan.label : "Plan unavailable"}</strong>
            <span>
              {!planKnown
                ? "We couldn't reach your plan details just now. Your plan and purchases are unaffected — refresh in a moment."
                : plan.premium
                  ? plan.renews
                    ? `Renews ${plan.renews}`
                    : "Active. Thanks for supporting EasyFrame."
                  : "Unlimited mockups, exports up to 2K."}
            </span>
          </div>
          {planKnown && !plan.premium ? (
            <Link className="auth-btn primary small" href="/pricing">
              Upgrade
            </Link>
          ) : null}
        </div>
      </section>

      <section className="auth-card" id="password">
        <h2 className="auth-h2">
          <KeyRound size={16} /> {resetMode ? "Set a new password" : "Password"}
        </h2>
        <p className="auth-note">
          {resetMode
            ? "Choose a new password for your account."
            : "Set or change the password you use to sign in. You can always sign in with an emailed code instead."}
        </p>
        <form className="auth-form" onSubmit={changePassword}>
          <label className="auth-field">
            <span>New password</span>
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={MIN_PASSWORD} required autoFocus={resetMode} />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={MIN_PASSWORD} required />
          </label>
          {status.kind === "error" ? <p className="auth-msg error" role="alert">{status.message}</p> : null}
          {status.kind === "ok" ? (
            <p className="auth-msg ok" role="status">
              <Check size={14} /> {status.message}
            </p>
          ) : null}
          <button className="auth-btn primary" disabled={status.kind === "busy"}>
            {status.kind === "busy" ? "Saving…" : "Save password"}
          </button>
        </form>
      </section>

      <section className="auth-card">
        <h2 className="auth-h2">
          <Receipt size={16} /> Purchases
        </h2>
        {purchases.length ? (
          <ul className="auth-list">
            {purchases.map((p) => (
              <li key={p.id}>
                <span>{eventLabel(p.type)}</span>
                <time dateTime={p.date}>{p.dateLabel}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="auth-note">{planKnown ? `No purchases yet. Anything you buy with ${email} shows up here.` : "Purchase history is temporarily unavailable."}</p>
        )}
      </section>

      <button className="auth-btn ghost" onClick={() => signOutApp({ callbackUrl: "/" })}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}
