import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError, fetchCurrentUser, obtainTokenPair, refreshAccessToken } from "./backend";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("obtainTokenPair", () => {
  it("posts credentials as JSON to the token endpoint and returns the pair", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { access: "a", refresh: "r" }));
    vi.stubGlobal("fetch", fetchMock);

    const pair = await obtainTokenPair("editor", "hunter2");

    expect(pair).toEqual({ access: "a", refresh: "r" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/token\/$/);
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(JSON.parse(init.body)).toEqual({ username: "editor", password: "hunter2" });
  });

  it("raises invalid_credentials for a 401 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { detail: "no" })));

    await expect(obtainTokenPair("editor", "wrong")).rejects.toMatchObject({
      code: "invalid_credentials",
    } satisfies Partial<AuthError>);
  });

  it("raises upstream_error for any other non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, {})));

    await expect(obtainTokenPair("editor", "hunter2")).rejects.toMatchObject({
      code: "upstream_error",
    } satisfies Partial<AuthError>);
  });
});

describe("refreshAccessToken", () => {
  it("posts the refresh token and returns a new access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { access: "new-access" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshAccessToken("the-refresh-token");

    expect(result).toEqual({ access: "new-access" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/token\/refresh\/$/);
    expect(JSON.parse(init.body)).toEqual({ refresh: "the-refresh-token" });
  });

  it("raises refresh_failed when the backend rejects the refresh token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, {})));

    await expect(refreshAccessToken("expired")).rejects.toMatchObject({
      code: "refresh_failed",
    } satisfies Partial<AuthError>);
  });
});

describe("fetchCurrentUser", () => {
  it("sends the access token as a bearer header and returns the user", async () => {
    const user = { id: 7, username: "editor", email: "e@x.com", is_staff: true };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, user));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCurrentUser("the-access-token");

    expect(result).toEqual(user);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/inclusion-api\/admin\/me\/$/);
    expect(init.headers.Authorization).toBe("Bearer the-access-token");
  });

  it("raises upstream_error when the me endpoint is unreachable or rejects the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, {})));

    await expect(fetchCurrentUser("bad-token")).rejects.toMatchObject({
      code: "upstream_error",
    } satisfies Partial<AuthError>);
  });
});
