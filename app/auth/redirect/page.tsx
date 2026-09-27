import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";

// Legacy post-login landing (was next-auth's callbackUrl). Kept so old links work.
export default async function AuthRedirectPage() {
  const session = await getAppSession();
  redirect(session ? "/account" : "/login");
}
