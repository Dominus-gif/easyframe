"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Route-level boundary for /account. Without it, any failure while rendering the
 * page surfaces as Next's bare "Application error: a client-side exception has
 * occurred", which tells the user nothing and offers no way out.
 */
export default function AccountError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[account] render failed", error);
  }, [error]);

  return (
    <main className="mk mk-auth">
      <div className="auth-wrap">
        <section className="auth-card" style={{ textAlign: "center" }}>
          <p className="auth-plan-ic on" style={{ margin: "0 auto 14px", width: 44, height: 44 }}>
            <AlertCircle size={20} />
          </p>
          <h1 className="auth-h2" style={{ justifyContent: "center" }}>We couldn&apos;t load your account</h1>
          <p className="auth-note">
            Your account and any purchases are safe — this page just failed to load. Try again, and if it
            keeps happening email contact@easyframe.app{error.digest ? ` quoting ${error.digest}` : ""}.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button className="auth-btn primary" onClick={reset}>
              <RefreshCw size={15} /> Try again
            </button>
            <Link className="auth-btn ghost" href="/editor">Back to the editor</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
