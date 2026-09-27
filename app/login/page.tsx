import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import LoginForm from "@/components/auth/LoginForm";
import { getAppSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign in | EasyFrame",
  description: "Sign in to EasyFrame with your email and password, or a one-time code.",
  robots: { index: false, follow: true }
};
export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  "session-required": "Sign in to continue to checkout. Your purchase will be linked to this email.",
  link: "That link has expired or was already used. Request a new one below."
};

export default async function LoginPage({ searchParams }: { searchParams?: { next?: string; reason?: string; error?: string } }) {
  const next = safeNext(searchParams?.next);
  if (await getAppSession()) redirect(next);

  const notice = NOTICES[searchParams?.reason ?? ""] ?? NOTICES[searchParams?.error ?? ""] ?? null;

  return (
    <main className="mk mk-auth">
      <SiteNav />
      <LoginForm next={next} notice={notice} />
    </main>
  );
}
