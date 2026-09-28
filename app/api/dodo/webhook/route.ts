import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { grantPaidAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/** Constant-time string compare (avoids leaking match position via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify a Dodo webhook (Standard Webhooks spec): HMAC-SHA256 over
 * `${webhook-id}.${webhook-timestamp}.${rawBody}` with the base64-decoded
 * secret (minus its `whsec_` prefix); the signature header is one or more
 * space-separated `v1,<base64>` entries. 5-minute timestamp tolerance.
 */
async function verifyDodoSignature(headers: Headers, rawBody: string): Promise<boolean> {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  // No secret configured: reject in production, allow locally for testing.
  if (!secret) return process.env.NODE_ENV !== "production";

  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sig = headers.get("webhook-signature");
  if (!id || !ts || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  const t = Number.parseInt(ts, 10);
  if (!Number.isFinite(t) || Math.abs(now - t) > 300) return false;

  const keyRaw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(keyRaw), (c) => c.charCodeAt(0));
  } catch {
    keyBytes = new TextEncoder().encode(keyRaw);
  }

  const key = await crypto.subtle.importKey("raw", keyBytes as unknown as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${rawBody}`) as unknown as BufferSource);
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return sig
    .split(" ")
    .map((part) => (part.includes(",") ? part.split(",")[1] : part))
    .some((provided) => safeEqual(provided, expected));
}

type DodoPayload = {
  id?: string;
  type?: string;
  data?: {
    customer?: { email?: string; id?: string; customer_id?: string };
    customer_email?: string;
    product_id?: string;
    product_cart?: Array<{ product_id?: string }>;
    payment_id?: string;
    subscription_id?: string;
    status?: string;
  };
};

export async function POST(request: Request) {
  // Read the raw body once — HMAC must run over the exact bytes Dodo signed.
  const rawBody = await request.text();
  if (!(await verifyDodoSignature(request.headers, rawBody))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: DodoPayload;
  try {
    payload = JSON.parse(rawBody) as DodoPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventId = payload.id ?? crypto.randomUUID();
  const eventType = payload.type ?? "unknown";
  const customerEmail = payload.data?.customer?.email ?? payload.data?.customer_email;
  const customerId = payload.data?.customer?.customer_id ?? payload.data?.customer?.id;
  const productId = payload.data?.product_id ?? payload.data?.product_cart?.[0]?.product_id;

  let userId: string | undefined;
  if (customerEmail) {
    // Accounts are stored with a lowercased email; match case-insensitively.
    const user = await prisma.user.findFirst({ where: { email: { equals: customerEmail.trim(), mode: "insensitive" } } });
    userId = user?.id;

    if (user) {
      const plan =
        productId && productId === process.env.DODO_LIFETIME_PRODUCT_ID
          ? "lifetime"
          : productId && productId === process.env.DODO_YEARLY_PRODUCT_ID
            ? "yearly"
            : productId && productId === process.env.DODO_MONTHLY_PRODUCT_ID
              ? "monthly"
              : user.subscriptionPlan;

      const paidEvent = ["subscription.created", "subscription.active", "payment.successful", "payment.succeeded", "payment.success"].includes(eventType);

      if (paidEvent && (plan === "monthly" || plan === "yearly" || plan === "lifetime")) {
        await grantPaidAccess(user.id, plan, payload.data?.subscription_id, customerId);
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            dodoCustomerId: customerId ?? user.dodoCustomerId,
            subscriptionPlan: plan,
            subscriptionStatus: payload.data?.status ?? user.subscriptionStatus,
            lifetimeAccess: plan === "lifetime" ? true : user.lifetimeAccess,
            trialUsed: true
          }
        });

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            planType: plan ?? "free",
            status: payload.data?.status ?? "canceled",
            dodoCustomerId: customerId,
            dodoSubscriptionId: payload.data?.subscription_id,
            cancelAtPeriodEnd: ["subscription.cancelled", "subscription.canceled"].includes(eventType)
          },
          update: {
            status: payload.data?.status ?? "canceled",
            dodoCustomerId: customerId ?? undefined,
            dodoSubscriptionId: payload.data?.subscription_id ?? undefined,
            cancelAtPeriodEnd: ["subscription.cancelled", "subscription.canceled"].includes(eventType)
          }
        });
      }
    }
  }

  await prisma.paymentEvent.upsert({
    where: { eventId },
    create: {
      eventId,
      eventType,
      userId,
      payloadJson: JSON.stringify(payload)
    },
    update: {}
  });

  return NextResponse.json({ received: true });
}
