import { api } from "@/lib/api";

export async function GET() {
  try {
    const data = await api.mapPoints();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
