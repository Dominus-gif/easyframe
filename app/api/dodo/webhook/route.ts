import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { grantPaidAccess } from "@/lib/subscription";

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
  const signature = request.headers.get("dodo-signature") ?? request.headers.get("webhook-signature");
  if (process.env.DODO_WEBHOOK_SECRET && process.env.NODE_ENV === "production" && !signature) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 401 });
  }

  const payload = (await request.json()) as DodoPayload;
  const eventId = payload.id ?? crypto.randomUUID();
  const eventType = payload.type ?? "unknown";
  const customerEmail = payload.data?.customer?.email ?? payload.data?.customer_email;
  const customerId = payload.data?.customer?.customer_id ?? payload.data?.customer?.id;
  const productId = payload.data?.product_id ?? payload.data?.product_cart?.[0]?.product_id;

  let userId: string | undefined;
  if (customerEmail) {
    const user = await prisma.user.findUnique({ where: { email: customerEmail } });
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
