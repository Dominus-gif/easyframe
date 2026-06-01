import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { getUserAccess, grantPaidAccess } from "@/lib/subscription";

type DodoPayment = {
  payment_id?: string;
  status?: string | null;
  customer?: {
    email?: string | null;
    customer_id?: string | null;
    id?: string | null;
  } | null;
  product_cart?: Array<{
    product_id?: string | null;
    quantity?: number | null;
  }> | null;
  subscription_id?: string | null;
};

const DODO_API_BASE =
  process.env.DODO_API_BASE_URL ??
  (process.env.DODO_ENVIRONMENT === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com");

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { paymentId, plan } = (await request.json().catch(() => ({}))) as {
    paymentId?: string;
    plan?: string;
  };

  if (!paymentId || !paymentId.startsWith("pay_")) {
    return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
  }

  if (plan !== "monthly" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey || apiKey === "dodo_sandbox_api_key") {
    return NextResponse.json({ error: "Dodo API key is not configured" }, { status: 503 });
  }

  const response = await fetch(`${DODO_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Could not verify payment" }, { status: 502 });
  }

  const payment = (await response.json()) as DodoPayment;
  const paymentEmail = payment.customer?.email?.toLowerCase();
  const sessionEmail = session.user.email.toLowerCase();
  const purchasedProductIds = new Set((payment.product_cart ?? []).map((item) => item.product_id).filter(Boolean));
  const expectedProductId = plan === "lifetime" ? process.env.DODO_LIFETIME_PRODUCT_ID : process.env.DODO_MONTHLY_PRODUCT_ID;
  const productMatches = expectedProductId ? purchasedProductIds.has(expectedProductId) : purchasedProductIds.size === 0;
  const paid = payment.status === "succeeded";

  if (!paid || paymentEmail !== sessionEmail || !productMatches) {
    return NextResponse.json(
      {
        error: "Payment is not confirmed for this account",
        paid,
        emailMatches: paymentEmail === sessionEmail,
        productMatches
      },
      { status: 409 }
    );
  }

  await grantPaidAccess(session.user.id, plan, payment.subscription_id, payment.customer?.customer_id ?? payment.customer?.id);

  await prisma.paymentEvent.upsert({
    where: { eventId: `return-confirm:${paymentId}` },
    create: {
      eventId: `return-confirm:${paymentId}`,
      eventType: "payment.return_confirmed",
      userId: session.user.id,
      payloadJson: JSON.stringify(payment)
    },
    update: {}
  });

  const access = await getUserAccess(session.user.id);
  return NextResponse.json({
    ok: true,
    access: {
      ...access,
      expiresAt: access.expiresAt?.toISOString() ?? null
    }
  });
}
