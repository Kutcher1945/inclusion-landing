import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { AuthError, fetchCurrentUser, refreshAccessToken } from "@/lib/auth/backend";
import { isJwtExpired } from "@/lib/auth/jwt";
import { readSessionTokens } from "@/lib/auth/session";
import type { CurrentUser } from "@/lib/auth/backend";

export type Session = {
  user: CurrentUser;
  access: string;
};

/**
 * Reads the current session once per request (React `cache` deduplicates calls
 * from the layout and page when they both call this in the same render pass).
 *
 * Does a one-shot inline refresh if the access token is expired but the refresh
 * token is still valid — the same logic as the proxy, but without the ability to
 * persist the new token as a cookie (Server Components can't set cookies during
 * render). The proxy already set the new token on the response cookie, so the
 * browser will send it on subsequent requests. This retry is only needed for the
 * edge case where the proxy refreshed and the Server Component still sees the old
 * token in its copy of the request cookies.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const { access, refresh } = await readSessionTokens();
  if (!access) return null;

  let currentAccess = access;

  if (isJwtExpired(currentAccess) && refresh && !isJwtExpired(refresh)) {
    try {
      const { access: newAccess } = await refreshAccessToken(refresh);
      currentAccess = newAccess;
    } catch (error: unknown) {
      if (error instanceof AuthError) return null;
      throw error;
    }
  }

  try {
    const user = await fetchCurrentUser(currentAccess);
    return { user, access: currentAccess };
  } catch (error: unknown) {
    if (error instanceof AuthError) return null;
    throw error;
  }
});

/** Redirects to /login if there is no valid session. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
