import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isJwtExpired } from "./jwt";

function base64url(input: object | string): string {
  const json = typeof input === "string" ? input : JSON.stringify(input);
  return Buffer.from(json, "utf8").toString("base64url");
}

function makeToken(payload: object | string): string {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  return `${header}.${base64url(payload)}.dummy-signature`;
}

const ONE_HOUR = 60 * 60;

describe("decodeJwtPayload", () => {
  it("returns the decoded payload for a well-formed token", () => {
    const token = makeToken({ user_id: 7, exp: 1000, iat: 900 });

    expect(decodeJwtPayload(token)).toEqual({ user_id: 7, exp: 1000, iat: 900 });
  });

  it("returns null when the token does not have three segments", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("only.two")).toBeNull();
    expect(decodeJwtPayload("a.b.c.d")).toBeNull();
  });

  it("returns null when the payload segment is not valid base64url JSON", () => {
    const header = base64url({ alg: "HS256", typ: "JWT" });

    expect(decodeJwtPayload(`${header}.not-json.sig`)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });
});

describe("isJwtExpired", () => {
  it("returns false for a token whose exp is comfortably in the future", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = makeToken({ user_id: 1, exp: nowSeconds + ONE_HOUR });

    expect(isJwtExpired(token)).toBe(false);
  });

  it("returns true for a token whose exp is in the past", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = makeToken({ user_id: 1, exp: nowSeconds - ONE_HOUR });

    expect(isJwtExpired(token)).toBe(true);
  });

  it("treats a token expiring inside the clock-skew window as expired", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = makeToken({ user_id: 1, exp: nowSeconds + 10 });

    expect(isJwtExpired(token, 30)).toBe(true);
  });

  it("fails closed (treats as expired) when the token has no exp claim", () => {
    const token = makeToken({ user_id: 1 });

    expect(isJwtExpired(token)).toBe(true);
  });

  it("fails closed (treats as expired) when the token cannot be decoded", () => {
    expect(isJwtExpired("garbage")).toBe(true);
  });
});
