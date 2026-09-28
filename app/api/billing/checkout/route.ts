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
  const formData = await request.formData().catch(() => null);
  const plan = formData?.get("plan");
  const session = await getAppSession();
  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";
  const origin = new URL(request.url).origin;

  if (plan !== "monthly" && plan !== "lifetime") {
    return NextResponse.redirect(new URL("/pricing", origin), 303);
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
    return NextResponse.redirect(new URL("/pricing?checkout=missing", origin), 303);
  }

  const returnUrl = new URL("/billing/return", origin);
  returnUrl.searchParams.set("plan", plan);

  try {
    const res = await fetch(`${DODO_API_BASE}/checkouts`, {
      method: "POST",
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

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Dodo checkout create failed", res.status, detail.slice(0, 500));
      return NextResponse.redirect(new URL("/pricing?checkout=error", origin), 303);
    }

    const data = (await res.json()) as { checkout_url?: string; url?: string };
    const checkoutUrl = data.checkout_url ?? data.url;
    if (!checkoutUrl) {
      console.error("Dodo checkout: no checkout_url in response");
      return NextResponse.redirect(new URL("/pricing?checkout=error", origin), 303);
    }
    return NextResponse.redirect(checkoutUrl, 303);
  } catch (e) {
    console.error("Dodo checkout error", e instanceof Error ? e.message : e);
    return NextResponse.redirect(new URL("/pricing?checkout=error", origin), 303);
  }
}
