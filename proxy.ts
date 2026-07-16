import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/auth/server-proxy";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";

const PROTECTED_PREFIX = "/passports";
const LOGIN_PATH = "/login";

function cookieOptions(exp: number | undefined) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  };
}

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname;
  const isProtected = path.startsWith(PROTECTED_PREFIX);
  const isLogin = path === LOGIN_PATH;

  if (!isProtected && !isLogin) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  let currentAccess = accessToken;

  // Silent refresh: when the access token is expired but the refresh token is still valid,
  // obtain a new access token transparently so the user never sees a login redirect.
  if ((!currentAccess || isJwtExpired(currentAccess)) && refreshToken && !isJwtExpired(refreshToken)) {
    try {
      const { access: newAccess } = await refreshAccessToken(refreshToken);
      currentAccess = newAccess;
    } catch {
      currentAccess = null;
    }
  }

  const isAuthenticated = Boolean(currentAccess && !isJwtExpired(currentAccess));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, req.nextUrl);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL(PROTECTED_PREFIX, req.nextUrl));
  }

  const response = NextResponse.next();

  if (currentAccess && currentAccess !== accessToken) {
    const exp = decodeJwtPayload(currentAccess)?.exp;
    response.cookies.set(ACCESS_TOKEN_COOKIE, currentAccess, cookieOptions(exp));
  }

  return response;
}

export const config = {
  // Skip Next.js internals and static files; run on all other paths including
  // /passports/** and /login so the proxy can enforce the session gate.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
