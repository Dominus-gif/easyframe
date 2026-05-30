import { prisma } from "@/lib/prisma";

export type AccessStatus = {
  hasAccess: boolean;
  planType: "trial" | "monthly" | "yearly" | "lifetime" | "free";
  status: string;
  exportCount: number;
  exportsRemaining: number | null;
  expiresAt: Date | null;
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
      expiresAt: null
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
  const exportsRemaining = isTrial ? Math.max(0, 5 - subscription.exportCount) : null;

  return {
    hasAccess: active,
    planType: subscription.planType as AccessStatus["planType"],
    status: isExpired ? "expired" : subscription.status,
    exportCount: subscription.exportCount,
    exportsRemaining,
    expiresAt: subscription.expiresAt
  };
}

export async function grantTrialAccess(userId: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planType: "trial",
      status: "trialing",
      exportCount: 0,
      expiresAt
    },
    update: {
      planType: "trial",
      status: "trialing",
      exportCount: 0,
      expiresAt
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: "trial",
      subscriptionStatus: "trialing",
      exportCount: 0
    }
  });
}

export async function grantPaidAccess(userId: string, planType: "monthly" | "yearly" | "lifetime", dodoSubscriptionId?: string | null) {
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
      dodoSubscriptionId
    },
    update: {
      planType,
      status: "active",
      expiresAt,
      dodoSubscriptionId: dodoSubscriptionId ?? undefined
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: planType,
      subscriptionStatus: "active",
      lifetimeAccess: planType === "lifetime"
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
      exportCount: { lt: 5 }
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
    expiresAt: null
  };
}
