import "server-only";

const BASE =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://green-admin.smartalmaty.kz";

export type AuthErrorCode = "refresh_failed" | "upstream_error";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  const res = await fetch(`${BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) throw new AuthError("refresh_failed", `Refresh returned ${res.status}`);
  return res.json() as Promise<{ access: string }>;
}
