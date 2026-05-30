import MockupStudio from "@/components/MockupStudio";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUserAccess } from "@/lib/subscription";

export default async function StudioPage() {
  if (process.env.ALLOW_LOCAL_MOCK_SESSION !== "true") {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect("/login");
    }

    const access = await getUserAccess(session.user.id);
    if (!access.hasAccess) {
      redirect("/pricing");
    }
  }

  return <MockupStudio />;
}
