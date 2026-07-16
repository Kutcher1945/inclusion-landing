import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { setSession } from "@/lib/auth/session";

const bodySchema = z.object({
  access:   z.string().min(1),
  refresh:  z.string().min(1),
  username: z.string().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  await setSession(parsed.data);

  if (parsed.data.username) {
    const store = await cookies();
    store.set("passport_username", parsed.data.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return NextResponse.json({ ok: true });
}
