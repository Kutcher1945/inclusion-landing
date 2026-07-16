import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

function base64url(payload: object): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function makeToken(exp: number): string {
  return `${base64url({ alg: "HS256" })}.${base64url({ user_id: 1, exp })}.sig`;
}

const now = () => Math.floor(Date.now() / 1000);
const FUTURE_ACCESS = () => makeToken(now() + 30 * 60);
const FUTURE_REFRESH = () => makeToken(now() + 24 * 60 * 60);
const EXPIRED = () => makeToken(now() - 60);

const { refreshAccessToken } = vi.hoisted(() => ({ refreshAccessToken: vi.fn() }));
vi.mock("@/lib/auth/server-proxy", () => ({ refreshAccessToken }));

const { default: proxy } = await import("./proxy");

function makeRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = `http://localhost${path}`;
  const req = new NextRequest(url);
  Object.entries(cookies).forEach(([k, v]) => {
    req.cookies.set(k, v);
  });
  return req;
}

const ACCESS = "passport_access_token";
const REFRESH = "passport_refresh_token";

afterEach(() => {
  vi.clearAllMocks();
});

describe("proxy", () => {
  it("passes requests to non-protected, non-login paths without auth check", async () => {
    const res = await proxy(makeRequest("/"));
    expect(res.status).not.toBe(302);
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    const res = await proxy(makeRequest("/passports"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("includes the intended path as a `next` query param in the redirect", async () => {
    const res = await proxy(makeRequest("/passports/123"));
    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.get("next")).toBe("/passports/123");
  });

  it("allows authenticated users to reach protected routes", async () => {
    const res = await proxy(makeRequest("/passports", { [ACCESS]: FUTURE_ACCESS(), [REFRESH]: FUTURE_REFRESH() }));
    expect(res.status).not.toBe(307);
  });

  it("redirects already-authenticated users away from the login page", async () => {
    const res = await proxy(makeRequest("/login", { [ACCESS]: FUTURE_ACCESS(), [REFRESH]: FUTURE_REFRESH() }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/passports");
  });

  it("silently refreshes an expired access token when the refresh token is still valid", async () => {
    const newAccess = FUTURE_ACCESS();
    refreshAccessToken.mockResolvedValue({ access: newAccess });

    const res = await proxy(makeRequest("/passports", { [ACCESS]: EXPIRED(), [REFRESH]: FUTURE_REFRESH() }));

    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(res.status).not.toBe(307);
    expect(res.cookies.get(ACCESS)?.value).toBe(newAccess);
  });

  it("redirects to login when both access and refresh tokens are expired", async () => {
    const res = await proxy(makeRequest("/passports", { [ACCESS]: EXPIRED(), [REFRESH]: EXPIRED() }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to login when the refresh call fails", async () => {
    refreshAccessToken.mockRejectedValue(new Error("network error"));
    const res = await proxy(makeRequest("/passports", { [ACCESS]: EXPIRED(), [REFRESH]: FUTURE_REFRESH() }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});
