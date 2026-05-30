import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY || process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Call Deepgram Aura (TTS)
    const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram TTS Error:", errorText);
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status });
    }

    // Stream the audio binary back to the client
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process TTS request" }, { status: 500 });
  }
}
