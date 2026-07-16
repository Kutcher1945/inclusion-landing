import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isJwtExpired } from "@/lib/auth/jwt";
import { readSessionTokens } from "@/lib/auth/session";
import { cookies } from "next/headers";
import type { CurrentUser } from "@/lib/auth/schemas";

export type Session = {
  user: CurrentUser;
  access: string;
};

/**
 * Reads the current session without calling Django.
 * Auth validity is determined by the JWT expiry in the httpOnly cookie.
 * The username comes from the non-httpOnly `passport_username` cookie set at login.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const { access } = await readSessionTokens();
  if (!access) return null;
  if (isJwtExpired(access)) return null;

  const store = await cookies();
  const username = store.get("passport_username")?.value ?? "";

  return {
    access,
    user: {
      id: 0,
      username,
      email: "",
      first_name: "",
      last_name: "",
      is_staff: true,
    },
  };
});

/** Redirects to /login if there is no valid session. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
