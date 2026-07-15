import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession } from "@/lib/auth/session";

const bodySchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  await setSession(parsed.data);
  return NextResponse.json({ ok: true });
}
