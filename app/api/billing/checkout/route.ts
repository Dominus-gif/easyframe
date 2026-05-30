import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { grantPaidAccess } from "@/lib/subscription";

const checkoutUrls = {
  monthly: process.env.DODO_MONTHLY_CHECKOUT_URL,
  yearly: process.env.DODO_YEARLY_CHECKOUT_URL
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = formData.get("plan");
  const session = await getServerSession(authOptions);
  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";

  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.redirect(new URL("/pricing", request.url), 303);
  }

  if (!session?.user?.id) {
    if (localBypass) {
      return NextResponse.redirect(new URL("/studio", request.url), 303);
    }

    return NextResponse.redirect(new URL("/login?reason=session-required", request.url), 303);
  }

  const checkoutUrl = checkoutUrls[plan];
  if (checkoutUrl) {
    const url = new URL(checkoutUrl);
    if (session.user.email) url.searchParams.set("email", session.user.email);
    url.searchParams.set("user_id", session.user.id);
    url.searchParams.set("plan", plan);
    return NextResponse.redirect(url, 303);
  }

  if (process.env.NODE_ENV !== "production" || localBypass) {
    await grantPaidAccess(session.user.id, plan);
    return NextResponse.redirect(new URL("/studio", request.url), 303);
  }

  return NextResponse.redirect(new URL("/pricing?checkout=missing", request.url), 303);
}
