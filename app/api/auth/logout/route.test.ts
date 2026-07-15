import { afterEach, describe, expect, it, vi } from "vitest";

const { clearSession } = vi.hoisted(() => ({ clearSession: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ clearSession }));

const { POST } = await import("./route");

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/logout", () => {
  it("clears the session and returns 200", async () => {
    const res = await POST();

    expect(clearSession).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
