import { prisma } from "@/lib/prisma";
import { getServerSupabase } from "@/lib/supabase/server";

export type AppSession = {
  user: { id: string; email: string; name: string | null };
};

/**
 * The signed-in user, or null. Drop-in replacement for the old
 * `getServerSession(authOptions)`: `user.id` is our own Prisma user id.
 *
 * Accounts are keyed by email, which is what links everything together:
 * Dodo checkouts are opened with the signed-in email and the webhook matches
 * purchases back by email, so existing users (including former Google
 * sign-ins) keep their plan and purchase history when they sign in with the
 * same address.
 */
export async function getAppSession(): Promise<AppSession | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  // getUser() re-validates the token with Supabase (unlike getSession(), which
  // trusts the cookie), so this is safe to use for authorization.
  const { data, error } = await supabase.auth.getUser();
  const authUser = data.user;
  const email = authUser?.email?.trim().toLowerCase();
  if (error || !authUser || !email) return null;
  // Only a verified address may inherit an existing account and its purchases.
  if (!authUser.email_confirmed_at) return null;

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email,
        name: (authUser.user_metadata?.name as string | undefined) ?? null,
        emailVerified: new Date(authUser.email_confirmed_at)
      }
    }));

  return { user: { id: user.id, email: user.email ?? email, name: user.name } };
}
