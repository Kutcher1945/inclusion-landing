import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StoredCookie = { value: string; options?: Record<string, unknown> };

const store = new Map<string, StoredCookie>();

const cookiesMock = vi.fn(async () => ({
  get: (name: string) => {
    const entry = store.get(name);
    return entry ? { name, value: entry.value } : undefined;
  },
  set: (name: string, value: string, options?: Record<string, unknown>) => {
    store.set(name, { value, options });
  },
  delete: (name: string) => {
    store.delete(name);
  },
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

const {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSession,
  readSessionTokens,
  setSession,
} = await import("./session");

function base64url(payload: object): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function makeToken(exp: number): string {
  return `${base64url({ alg: "HS256" })}.${base64url({ user_id: 1, exp })}.sig`;
}

const FUTURE_ACCESS_EXP = Math.floor(Date.now() / 1000) + 30 * 60;
const FUTURE_REFRESH_EXP = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

beforeEach(() => {
  store.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("setSession", () => {
  it("stores both tokens as httpOnly, lax, root-path cookies with expiry from their JWT exp claims", async () => {
    const access = makeToken(FUTURE_ACCESS_EXP);
    const refresh = makeToken(FUTURE_REFRESH_EXP);

    await setSession({ access, refresh });

    const accessCookie = store.get(ACCESS_TOKEN_COOKIE);
    const refreshCookie = store.get(REFRESH_TOKEN_COOKIE);

    expect(accessCookie?.value).toBe(access);
    expect(accessCookie?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(accessCookie?.options?.expires).toEqual(new Date(FUTURE_ACCESS_EXP * 1000));

    expect(refreshCookie?.value).toBe(refresh);
    expect(refreshCookie?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(refreshCookie?.options?.expires).toEqual(new Date(FUTURE_REFRESH_EXP * 1000));
  });

  it("marks cookies secure in production but not in development", async () => {
    const access = makeToken(FUTURE_ACCESS_EXP);
    const refresh = makeToken(FUTURE_REFRESH_EXP);

    vi.stubEnv("NODE_ENV", "production");
    await setSession({ access, refresh });
    expect(store.get(ACCESS_TOKEN_COOKIE)?.options).toMatchObject({ secure: true });

    vi.stubEnv("NODE_ENV", "development");
    await setSession({ access, refresh });
    expect(store.get(ACCESS_TOKEN_COOKIE)?.options).toMatchObject({ secure: false });
  });
});

describe("clearSession", () => {
  it("removes both session cookies", async () => {
    store.set(ACCESS_TOKEN_COOKIE, { value: "a" });
    store.set(REFRESH_TOKEN_COOKIE, { value: "r" });

    await clearSession();

    expect(store.has(ACCESS_TOKEN_COOKIE)).toBe(false);
    expect(store.has(REFRESH_TOKEN_COOKIE)).toBe(false);
  });
});

describe("readSessionTokens", () => {
  it("returns null for tokens that aren't present", async () => {
    expect(await readSessionTokens()).toEqual({ access: null, refresh: null });
  });

  it("returns the raw cookie values when present", async () => {
    store.set(ACCESS_TOKEN_COOKIE, { value: "a-token" });
    store.set(REFRESH_TOKEN_COOKIE, { value: "r-token" });

    expect(await readSessionTokens()).toEqual({ access: "a-token", refresh: "r-token" });
  });
});
