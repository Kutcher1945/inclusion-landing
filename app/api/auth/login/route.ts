import { NextResponse } from "next/server";
import { AuthError, fetchCurrentUser, obtainTokenPair } from "@/lib/auth/backend";
import { loginCredentialsSchema } from "@/lib/auth/schemas";
import { setSession } from "@/lib/auth/session";

/**
 * BFF login endpoint. Proxies to the backend's `auth/token/` + the additive
 * `admin/me/` endpoint, and only grants a session (sets httpOnly cookies) when
 * the authenticated user is staff — gating non-staff users out at the door
 * rather than letting them reach `IsPassportEditor` 403s on every request.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = loginCredentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { username, password } = parsed.data;

  let tokens;
  try {
    tokens = await obtainTokenPair(username, password);
  } catch (error: unknown) {
    if (error instanceof AuthError && error.code === "invalid_credentials") {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  let user;
  try {
    user = await fetchCurrentUser(tokens.access);
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  if (!user.is_staff) {
    return NextResponse.json({ error: "not_staff" }, { status: 403 });
  }

  await setSession(tokens);
  return NextResponse.json({ user });
}
