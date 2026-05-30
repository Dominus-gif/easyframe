import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUserAccess } from "@/lib/subscription";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const access = await getUserAccess(session.user.id);
  redirect(access.hasAccess ? "/studio" : "/pricing");
}
