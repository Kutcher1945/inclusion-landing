export type JwtPayload = {
  exp?: number;
  iat?: number;
  user_id?: number;
};

/**
 * Decodes (without verifying) the payload segment of a JWT.
 *
 * The frontend never holds the backend's signing secret, so signature
 * verification isn't possible here — this is strictly an optimistic read of
 * `exp`/`user_id` for routing decisions. The backend remains the source of
 * truth and re-validates the token on every proxied request.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    const json = Buffer.from(segments[1], "base64url").toString("utf8");
    const payload = JSON.parse(json);
    if (typeof payload !== "object" || payload === null) return null;
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Treats undecodable tokens and tokens without an `exp` claim as expired
 * (fail closed) — an optimistic check should never wave through something it
 * can't read the expiry of.
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;

  const nowSeconds = Date.now() / 1000;
  return payload.exp - skewSeconds <= nowSeconds;
}
