import { NextRequest } from "next/server";

const API_KEY  = "j9Sutdt3RNg0qj5U4yYe1XdYzxIf2KHs";
const VOICE_ID = "c69964a6-ab8b-4f8a-9465-ec0925096ec8"; // Paul - Neutral (en_us, cross-lingual)

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  const spoken = text.replace(/(\d+)\.(\d+)/g, (_: string, int: string, dec: string) => `${int} point ${dec}`);

  const res = await fetch("https://api.mistral.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "voxtral-mini-tts-2603",
      input: spoken.slice(0, 4000),
      voice_id: VOICE_ID,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Mistral TTS error:", err);
    return Response.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ audio_data: data.audio_data });
}
