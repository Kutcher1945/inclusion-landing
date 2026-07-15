import { type NextRequest, NextResponse } from "next/server";
import { readSessionTokens } from "@/lib/auth/session";
import { restorePassport } from "@/lib/passports/detail-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { access } = await readSessionTokens();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const restored = await restorePassport(id);
  if (!restored) {
    return NextResponse.json({ error: "restore_failed" }, { status: 502 });
  }

  return NextResponse.json(restored);
}
