import { type NextRequest, NextResponse } from "next/server";
import { readSessionTokens } from "@/lib/auth/session";
import { createPassport } from "@/lib/passports/detail-api";
import { passportCreateBodySchema } from "@/lib/passports/detail-types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { access } = await readSessionTokens();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = passportCreateBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const created = await createPassport(parsed.data);
  if (!created) {
    return NextResponse.json({ error: "create_failed" }, { status: 502 });
  }

  return NextResponse.json(created, { status: 201 });
}
