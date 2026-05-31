import { prisma } from "@/lib/prisma";

export type AccessStatus = {
  hasAccess: boolean;
  planType: "trial" | "monthly" | "yearly" | "lifetime" | "free";
  status: string;
  exportCount: number;
  exportsRemaining: number | null;
  expiresAt: Date | null;
  trialUsed: boolean;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function getUserAccess(userId: string): Promise<AccessStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user) {
    return noAccess();
  }

  if (user.lifetimeAccess) {
    return {
      hasAccess: true,
      planType: "lifetime",
      status: "active",
      exportCount: user.subscription?.exportCount ?? user.exportCount,
      exportsRemaining: null,
      expiresAt: null,
      trialUsed: user.trialUsed
    };
  }

  const subscription = user.subscription;
  if (!subscription) {
    return noAccess(user.subscriptionStatus, user.subscriptionPlan);
  }

  const now = new Date();
  const isExpired = subscription.expiresAt ? subscription.expiresAt.getTime() <= now.getTime() : false;
  const active = ACTIVE_STATUSES.has(subscription.status) && !isExpired;
  const isTrial = subscription.planType === "trial";
  const trialExportLimit = subscription.trialExportLimit ?? 5;
  const exportsRemaining = isTrial ? Math.max(0, trialExportLimit - subscription.exportCount) : null;
  const trialLimitReached = isTrial && (exportsRemaining ?? 0) <= 0;

  return {
    hasAccess: active && !trialLimitReached,
    planType: subscription.planType as AccessStatus["planType"],
    status: isExpired ? "expired" : trialLimitReached ? "trial_limit_reached" : subscription.status,
    exportCount: subscription.exportCount,
    exportsRemaining,
    expiresAt: subscription.expiresAt,
    trialUsed: user.trialUsed
  };
}

export async function grantTrialAccess(userId: string): Promise<AccessStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  });

  if (!user) {
    return noAccess();
  }

  if (user.lifetimeAccess || (user.subscription && user.subscription.planType !== "trial" && ACTIVE_STATUSES.has(user.subscription.status))) {
    return getUserAccess(userId);
  }

  if (user.trialUsed || user.subscription?.planType === "trial") {
    return getUserAccess(userId);
  }

  const trialStartedAt = new Date();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planType: "trial",
      status: "trialing",
      exportCount: 0,
      trialExportLimit: 5,
      trialStartedAt,
      expiresAt
    },
    update: {
      planType: "trial",
      status: "trialing",
      exportCount: 0,
      trialExportLimit: 5,
      trialStartedAt,
      expiresAt
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: "trial",
      subscriptionStatus: "trialing",
      trialUsed: true,
      trialStartedAt,
      trialEndsAt: expiresAt,
      exportCount: 0
    }
  });

  return getUserAccess(userId);
}

export async function grantPaidAccess(
  userId: string,
  planType: "monthly" | "yearly" | "lifetime",
  dodoSubscriptionId?: string | null,
  dodoCustomerId?: string | null
) {
  const expiresAt =
    planType === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : planType === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planType,
      status: "active",
      exportCount: 0,
      expiresAt,
      dodoCustomerId,
      dodoSubscriptionId,
      lastPaymentAt: new Date()
    },
    update: {
      planType,
      status: "active",
      expiresAt,
      dodoCustomerId: dodoCustomerId ?? undefined,
      dodoSubscriptionId: dodoSubscriptionId ?? undefined,
      cancelAtPeriodEnd: false,
      lastPaymentAt: new Date()
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: planType,
      subscriptionStatus: "active",
      dodoCustomerId: dodoCustomerId ?? undefined,
      lifetimeAccess: planType === "lifetime",
      trialUsed: true
    }
  });
}

export async function consumeExport(userId: string): Promise<AccessStatus> {
  const access = await getUserAccess(userId);

  if (!access.hasAccess) {
    return access;
  }

  if (access.planType !== "trial") {
    return access;
  }

  if ((access.exportsRemaining ?? 0) <= 0) {
    return { ...access, hasAccess: false, exportsRemaining: 0 };
  }

  const updated = await prisma.subscription.updateMany({
    where: {
      userId,
      planType: "trial",
      exportCount: { lt: access.exportsRemaining === null ? 5 : access.exportCount + (access.exportsRemaining ?? 0) }
    },
    data: { exportCount: { increment: 1 } }
  });

  if (updated.count === 0) {
    const latestAccess = await getUserAccess(userId);
    return { ...latestAccess, exportsRemaining: 0 };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { exportCount: { increment: 1 } }
  });

  return getUserAccess(userId);
}

function noAccess(status = "free", plan?: string | null): AccessStatus {
  return {
    hasAccess: false,
    planType: (plan ?? "free") as AccessStatus["planType"],
    status,
      exportCount: 0,
      exportsRemaining: 0,
      expiresAt: null,
      trialUsed: false
    };
}
