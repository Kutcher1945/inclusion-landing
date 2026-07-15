import "server-only";
import { cookies } from "next/headers";
import { decodeJwtPayload } from "./jwt";
import type { TokenPair } from "./backend";

export const ACCESS_TOKEN_COOKIE = "passport_access_token";
export const REFRESH_TOKEN_COOKIE = "passport_refresh_token";

function baseCookieOptions() {
  return {
    httpOnly: true,
    // Read at call time (not module load) so it reflects the runtime environment —
    // matters for tests and for any process that flips NODE_ENV after import.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function expiryOf(token: string): Date | undefined {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" ? new Date(exp * 1000) : undefined;
}

/**
 * Persists a freshly-issued token pair as httpOnly cookies. Each cookie's
 * `expires` mirrors its own JWT `exp` claim, so the browser stops sending an
 * expired token on its own rather than relying solely on server-side checks.
 *
 * Must run inside a Server Action or Route Handler — `cookies().set()` is not
 * permitted during Server Component rendering.
 */
export async function setSession(tokens: TokenPair): Promise<void> {
  const store = await cookies();
  const options = baseCookieOptions();
  store.set(ACCESS_TOKEN_COOKIE, tokens.access, { ...options, expires: expiryOf(tokens.access) });
  store.set(REFRESH_TOKEN_COOKIE, tokens.refresh, { ...options, expires: expiryOf(tokens.refresh) });
}

/** Clears both session cookies. Must run inside a Server Action or Route Handler. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export type SessionTokens = {
  access: string | null;
  refresh: string | null;
};

/** Read-only lookup — safe to call from Server Components, layouts, and the DAL. */
export async function readSessionTokens(): Promise<SessionTokens> {
  const store = await cookies();
  return {
    access: store.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refresh: store.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}
