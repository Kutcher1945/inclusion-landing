import { NextResponse } from "next/server";
import { readSessionTokens } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const { access } = await readSessionTokens();
  if (!access) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json({ access });
}
