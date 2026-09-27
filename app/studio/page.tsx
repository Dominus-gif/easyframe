import MockupStudio from "@/components/MockupStudio";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";

export default async function StudioPage() {
  if (process.env.ALLOW_LOCAL_MOCK_SESSION !== "true") {
    const session = await getAppSession();

    if (!session?.user?.id) {
      redirect("/login");
    }

    const access = await getUserAccess(session.user.id);
    if (!access.hasAccess) {
      const reason = access.trialUsed ? "trial-ended" : "plan-required";
      redirect(`/pricing?reason=${reason}`);
    }
  }

  return <MockupStudio />;
}
