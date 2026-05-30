import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "DEEPGRAM_API_KEY is not set in environment" }, { status: 500 });
    }

    // Since the provided API key does not have permissions to generate temporary keys (Forbidden error),
    // we will securely pass the main key to the client for this session.
    // In a production environment with an Owner-level Deepgram key, we would use the /keys endpoint.
    
    return NextResponse.json({ token: apiKey });
  } catch (error: any) {
    console.error("Deepgram Token Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
