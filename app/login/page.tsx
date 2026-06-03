"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { EasyFrameMark } from "@/components/EasyFrameLogo";

const authErrorMessages: Record<string, string> = {
  Configuration: "Google sign-in is not configured for this EasyFrame environment yet.",
  AccessDenied: "Google sign-in was cancelled or denied.",
  OAuthSignin: "Could not start Google sign-in. Check the OAuth client configuration.",
  OAuthCallback: "Google returned an invalid callback. Check NEXTAUTH_URL and Google redirect URIs.",
  OAuthCreateAccount: "Google sign-in worked, but EasyFrame could not create the account.",
  Callback: "EasyFrame could not finish the sign-in, please refresh the page and try again.",
  Default: "Sign-in failed. Please try again."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">
        <span><EasyFrameMark size={34} /></span>
        <strong>EasyFrame</strong>
      </Link>
      <section className="auth-card">
        <span className="auth-kicker"><Sparkles size={15} /> Welcome to EasyFrame</span>
        <h1>Preparing sign in...</h1>
      </section>
      <AuthStyles />
    </main>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const authError = searchParams.get("error");
  const message = useMemo(() => {
    if (localError) return localError;
    if (!authError) return null;
    return authErrorMessages[authError] ?? authErrorMessages.Default;
  }, [authError, localError]);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { google?: boolean }) => {
        if (alive) setGoogleReady(Boolean(data.google));
      })
      .catch(() => {
        if (alive) setGoogleReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (googleReady === false) {
      setLocalError("Google sign-in is not configured for this EasyFrame deployment yet. Add valid Google OAuth values in Vercel, then redeploy.");
      return;
    }
    setLocalError(null);
    setIsStarting(true);
    try {
      await signIn("google", { callbackUrl: "/auth/redirect" });
    } catch {
      setIsStarting(false);
      setLocalError("Could not open Google sign-in. Please refresh and try again.");
    }
  };

  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/">
        <span><EasyFrameMark size={34} /></span>
        <strong>EasyFrame</strong>
      </Link>

      <section className="auth-card">
        <span className="auth-kicker"><Sparkles size={15} /> Welcome to EasyFrame</span>
        <h1>Sign in to start creating polished mockups.</h1>
        <p>Use your account to manage exports, plans, templates, and saved mockup projects.</p>

        {message ? <div className="auth-error">{message}</div> : null}

        <button className="oauth-button" onClick={handleGoogleSignIn} disabled={isStarting || googleReady === null}>
          <GoogleLogo />
          {isStarting ? "Opening Google..." : googleReady === null ? "Checking Google..." : "Continue with Google"}
          <ArrowRight size={17} />
        </button>

        <Link className="local-link" href="/pricing">Show plans first</Link>

        <div className="auth-notes">
          <span><ShieldCheck size={16} /> Secure OAuth login</span>
          <span>After login, active users go straight to the app.</span>
        </div>
      </section>

      <AuthStyles />
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AuthStyles() {
  return (
    <style jsx global>{`
      .auth-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 28px;
        color: #f8f6ef;
        background:
          radial-gradient(circle at 18% 12%, rgba(255, 104, 88, 0.18), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(109, 93, 252, 0.24), transparent 30%),
          linear-gradient(145deg, #08090a 0%, #101211 52%, #171612 100%);
        font-family: var(--font-sans);
      }

      .auth-brand {
        position: fixed;
        top: 28px;
        left: 28px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fffaf2;
        text-decoration: none;
      }

      .auth-brand span {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        overflow: visible;
      }

      .auth-brand span img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .auth-brand strong {
        font-size: 25px;
        letter-spacing: -0.04em;
      }

      .auth-card {
        width: min(100%, 520px);
        padding: 34px;
        border-radius: 30px;
        border: 1px solid rgba(255,255,255,.12);
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
        box-shadow: 0 34px 110px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08);
      }

      .auth-kicker {
        width: max-content;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        padding: 0 14px;
        border-radius: 999px;
        color: rgba(248,246,239,.86);
        background: rgba(255,255,255,.07);
        border: 1px solid rgba(255,255,255,.1);
        font-size: 13px;
        font-weight: 800;
      }

      .auth-card h1 {
        margin: 24px 0 14px;
        color: #fffdf7;
        font-size: 44px;
        line-height: 1;
        letter-spacing: -0.06em;
      }

      .auth-card p {
        margin: 0;
        color: rgba(248,246,239,.66);
        font-size: 16px;
        line-height: 1.55;
      }

      .oauth-button,
      .local-link {
        width: 100%;
        min-height: 54px;
        margin-top: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 0;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 850;
        text-decoration: none;
        cursor: pointer;
      }

      .oauth-button {
        color: #172033;
        background: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.82);
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.92);
      }

      .oauth-button:disabled {
        cursor: wait;
        opacity: 0.72;
      }

      .oauth-button:hover:not(:disabled),
      .oauth-button:focus-visible:not(:disabled) {
        color: #0f172a;
        background: #ffffff;
        border-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 18px 44px rgba(88, 213, 201, 0.18), 0 0 0 1px rgba(88, 213, 201, 0.18);
      }

      .google-logo {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: block;
      }

      .auth-error {
        margin-top: 20px;
        padding: 13px 14px;
        border-radius: 15px;
        border: 1px solid rgba(255, 104, 88, 0.32);
        color: #ffd6d1;
        background: rgba(255, 104, 88, 0.12);
        font-size: 13px;
        font-weight: 750;
        line-height: 1.4;
      }

      .local-link {
        color: #f8f6ef;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.12);
      }

      .auth-notes {
        display: grid;
        gap: 8px;
        margin-top: 22px;
        color: rgba(248,246,239,.58);
        font-size: 13px;
        font-weight: 650;
      }

      .auth-notes span {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .auth-notes svg {
        color: #74f0b3;
      }

      .auth-shell {
        color: var(--text-primary);
        background:
          radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
          radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.08), transparent 28%),
          linear-gradient(145deg, #07080a 0%, #0b0c10 52%, #08090b 100%);
      }

      .oauth-button {
        color: #172033;
        background: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.82);
        box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.92);
      }

      .auth-brand span {
        background: transparent;
        box-shadow: none;
      }

      .auth-brand strong {
        color: var(--text-primary);
        font-size: 24px;
        font-weight: 700;
      }

      .auth-card {
        border-color: var(--stroke);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
          var(--panel);
        box-shadow: var(--shadow-panel);
      }

      .auth-kicker,
      .local-link {
        border-color: var(--stroke);
        background: rgba(255, 255, 255, 0.045);
      }

      .auth-card h1 {
        color: var(--text-primary);
        letter-spacing: -0.055em;
      }

      .auth-card p,
      .auth-notes {
        color: var(--text-muted);
      }

      .oauth-button,
      .local-link {
        min-height: 50px;
        border-radius: 14px;
        font-weight: 650;
      }
    `}</style>
  );
}
