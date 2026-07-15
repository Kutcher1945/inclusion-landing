import { type NextRequest, NextResponse } from "next/server";
import { readSessionTokens } from "@/lib/auth/session";
import { patchPassport, deletePassport } from "@/lib/passports/detail-api";
import { passportPatchBodySchema } from "@/lib/passports/detail-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { access } = await readSessionTokens();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = passportPatchBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const updated = await patchPassport(id, parsed.data);

  if (!updated) {
    return NextResponse.json({ error: "update_failed" }, { status: 502 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { access } = await readSessionTokens();
  if (!access) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const success = await deletePassport(id);
  if (!success) {
    return NextResponse.json({ error: "delete_failed" }, { status: 502 });
  }

  return new NextResponse(null, { status: 204 });
}
