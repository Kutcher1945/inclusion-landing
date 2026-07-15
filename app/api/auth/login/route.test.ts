import { afterEach, describe, expect, it, vi } from "vitest";

const { obtainTokenPair, fetchCurrentUser, setSession } = vi.hoisted(() => ({
  obtainTokenPair: vi.fn(),
  fetchCurrentUser: vi.fn(),
  setSession: vi.fn(),
}));

vi.mock("@/lib/auth/backend", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/backend")>();
  return { ...actual, obtainTokenPair, fetchCurrentUser };
});
vi.mock("@/lib/auth/session", () => ({ setSession }));

const { AuthError } = await import("@/lib/auth/backend");

const { POST } = await import("./route");

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const TOKENS = { access: "access-tok", refresh: "refresh-tok" };
const STAFF_USER = { id: 1, username: "editor", email: "e@x.com", is_staff: true };
const NON_STAFF_USER = { id: 2, username: "visitor", email: "v@x.com", is_staff: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/login", () => {
  it("rejects malformed bodies before calling the backend", async () => {
    const res = await POST(postRequest({ username: "", password: "" }));

    expect(res.status).toBe(400);
    expect(obtainTokenPair).not.toHaveBeenCalled();
  });

  it("returns 401 when the backend rejects the credentials", async () => {
    obtainTokenPair.mockRejectedValue(new AuthError("invalid_credentials", "nope"));

    const res = await POST(postRequest({ username: "editor", password: "wrong" }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "invalid_credentials" });
    expect(setSession).not.toHaveBeenCalled();
  });

  it("grants a session and returns the user when credentials are valid and the user is staff", async () => {
    obtainTokenPair.mockResolvedValue(TOKENS);
    fetchCurrentUser.mockResolvedValue(STAFF_USER);

    const res = await POST(postRequest({ username: "editor", password: "right" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ user: STAFF_USER });
    expect(setSession).toHaveBeenCalledWith(TOKENS);
  });

  it("rejects valid credentials for non-staff users without granting a session", async () => {
    obtainTokenPair.mockResolvedValue(TOKENS);
    fetchCurrentUser.mockResolvedValue(NON_STAFF_USER);

    const res = await POST(postRequest({ username: "visitor", password: "right" }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({ error: "not_staff" });
    expect(setSession).not.toHaveBeenCalled();
  });

  it("returns a 502 when the upstream backend fails unexpectedly", async () => {
    obtainTokenPair.mockRejectedValue(new AuthError("upstream_error", "boom"));

    const res = await POST(postRequest({ username: "editor", password: "right" }));

    expect(res.status).toBe(502);
    expect(setSession).not.toHaveBeenCalled();
  });
});
