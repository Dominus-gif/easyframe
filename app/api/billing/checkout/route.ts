import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { grantPaidAccess } from "@/lib/subscription";

// Per-user (reads the session cookie): never prerender.
export const dynamic = "force-dynamic";

const DODO_API_BASE =
  process.env.DODO_API_BASE_URL ??
  (process.env.DODO_ENVIRONMENT === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com");

const productIds: Record<string, string | undefined> = {
  monthly: process.env.DODO_MONTHLY_PRODUCT_ID,
  lifetime: process.env.DODO_LIFETIME_PRODUCT_ID
};

/** Start a Dodo checkout for the signed-in user. Creates a checkout session via
 *  the API using the plan's product id, with the customer email locked to the
 *  account so the webhook can reliably match the purchase back. */
export async function POST(request: Request) {
  // Origin is needed for every redirect below, including the failure ones, so it
  // is resolved before anything that can throw.
  let origin = "https://www.easyframe.app";
  try {
    origin = new URL(request.url).origin;
  } catch {
    /* keep the fallback */
  }
  const fail = (why: string, detail?: unknown) => {
    console.error(`[checkout] ${why}`, detail instanceof Error ? `${detail.name}: ${detail.message}` : detail ?? "");
    return NextResponse.redirect(new URL(`/pricing?checkout=error&why=${why}`, origin), 303);
  };

  // Everything runs inside one guard: on Workers an uncaught throw becomes a
  // raw "Error 1101" page, so the user must never see one from checkout.
  try {
    const formData = await request.formData().catch(() => null);
    const plan = formData?.get("plan");
    const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";

    if (plan !== "monthly" && plan !== "lifetime") {
      return NextResponse.redirect(new URL("/pricing", origin), 303);
    }

    // Resolving the session touches Supabase and the database; a hiccup in either
    // must surface as a friendly page, not a Worker exception.
    let session;
    try {
      session = await getAppSession();
    } catch (e) {
      return fail("session", e);
    }

    if (!session?.user?.id || !session.user.email) {
      if (localBypass) return NextResponse.redirect(new URL("/editor", origin), 303);
      return NextResponse.redirect(new URL(`/login?reason=session-required&next=${encodeURIComponent("/pricing")}`, origin), 303);
    }

    const apiKey = process.env.DODO_API_KEY;
    const productId = productIds[plan];

    // Local/dev without Dodo configured: grant directly so the flow is testable.
    if ((!apiKey || !productId) && (process.env.NODE_ENV !== "production" || localBypass)) {
      await grantPaidAccess(session.user.id, plan);
      return NextResponse.redirect(new URL("/editor", origin), 303);
    }
    if (!apiKey || !productId) {
      // Misconfigured in production — don't dead-end the user.
      console.error(`[checkout] missing ${!apiKey ? "DODO_API_KEY" : `product id for ${plan}`}`);
      return NextResponse.redirect(new URL("/pricing?checkout=missing", origin), 303);
    }

    const returnUrl = new URL("/billing/return", origin);
    returnUrl.searchParams.set("plan", plan);

    // Don't let a slow payment API hold the request open until the Worker dies.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 12_000);
    let res: Response;
    try {
      res = await fetch(`${DODO_API_BASE}/checkouts`, {
        method: "POST",
        signal: abort.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          product_cart: [{ product_id: productId, quantity: 1 }],
          customer: { email: session.user.email, name: session.user.name ?? undefined },
          return_url: returnUrl.toString(),
          metadata: { user_id: session.user.id, plan },
          // Lock the email to the signed-in account (keeps purchase attribution correct).
          feature_flags: { allow_customer_editing_email: false }
        })
      });
    } catch (e) {
      return fail("network", e);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[checkout] Dodo create failed", res.status, detail.slice(0, 500));
      return NextResponse.redirect(new URL(`/pricing?checkout=error&why=dodo-${res.status}`, origin), 303);
    }

    const data = (await res.json().catch(() => null)) as { checkout_url?: string; url?: string } | null;
    const checkoutUrl = data?.checkout_url ?? data?.url;
    if (!checkoutUrl) return fail("no-url");

    // Only ever hand the browser an absolute http(s) URL.
    let target: URL;
    try {
      target = new URL(checkoutUrl);
      if (target.protocol !== "https:" && target.protocol !== "http:") throw new Error("bad protocol");
    } catch (e) {
      return fail("bad-url", e);
    }
    return NextResponse.redirect(target.toString(), 303);
  } catch (e) {
    return fail("unexpected", e);
  }
}
