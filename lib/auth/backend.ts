import "server-only";
import { currentUserSchema } from "./schemas";
import type { CurrentUser } from "./schemas";

// Use a non-public env var so the backend URL isn't forced into the client bundle.
// Falls back to NEXT_PUBLIC_API_BASE_URL for compatibility with existing deployments.
const BASE_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://green-admin.smartalmaty.kz";

export type { CurrentUser };

export type TokenPair = {
  access: string;
  refresh: string;
};

export type AuthErrorCode = "invalid_credentials" | "refresh_failed" | "upstream_error";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

async function postJson(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/** Exchanges a username/password for an access/refresh token pair via `auth/token/`. */
export async function obtainTokenPair(username: string, password: string): Promise<TokenPair> {
  const res = await postJson("/auth/token/", { username, password });

  if (res.status === 401) throw new AuthError("invalid_credentials", "Invalid username or password");
  if (!res.ok) throw new AuthError("upstream_error", `Token endpoint returned ${res.status}`);

  return res.json() as Promise<TokenPair>;
}

/** Exchanges a refresh token for a new access token via `auth/token/refresh/`. */
export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  const res = await postJson("/auth/token/refresh/", { refresh: refreshToken });

  if (!res.ok) throw new AuthError("refresh_failed", `Refresh endpoint returned ${res.status}`);

  return res.json() as Promise<{ access: string }>;
}

/**
 * Fetches the authenticated user's identity, including `is_staff` — a claim the
 * access token itself doesn't carry (no custom TokenObtainPairSerializer is
 * configured on the backend). Parses the response with a Zod schema so that
 * `is_staff` is a real boolean at runtime, not just a TypeScript cast.
 */
export async function fetchCurrentUser(accessToken: string): Promise<CurrentUser> {
  const res = await fetch(`${BASE_URL}/inclusion-api/admin/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) throw new AuthError("upstream_error", `Me endpoint returned ${res.status}`);

  const parsed = currentUserSchema.safeParse(await res.json());
  if (!parsed.success) throw new AuthError("upstream_error", "Me endpoint returned unexpected shape");

  return parsed.data;
}
