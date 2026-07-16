import { NextResponse } from "next/server";
import { readSessionTokens } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const { refresh } = await readSessionTokens();
  if (!refresh) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json({ refresh });
}
