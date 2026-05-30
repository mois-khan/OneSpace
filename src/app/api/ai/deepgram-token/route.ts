import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "DEEPGRAM_API_KEY is not set in environment" }, { status: 500 });
    }

    // 1. Fetch the first project associated with this API Key
    const projectRes = await fetch("https://api.deepgram.com/v1/projects", {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!projectRes.ok) {
      throw new Error(`Failed to fetch Deepgram projects: ${projectRes.statusText}`);
    }

    const projectData = await projectRes.json();
    const projectId = projectData.projects?.[0]?.project_id;

    if (!projectId) {
      throw new Error("No Deepgram project found for this API key.");
    }

    // 2. Generate a temporary, short-lived token for client-side WebSocket usage
    const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "Temporary Client Token for JARVIS",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 120, // Valid for 2 minutes
      }),
    });

    if (!keyRes.ok) {
      throw new Error(`Failed to generate temporary key: ${keyRes.statusText}`);
    }

    const keyData = await keyRes.json();

    return NextResponse.json({ token: keyData.api_key });
  } catch (error: any) {
    console.error("Deepgram Token Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
