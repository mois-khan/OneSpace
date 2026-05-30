import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { message, context, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    // Construct the system prompt using the context passed from the client
    const systemPrompt = `You are JARVIS, the exclusive AI assistant for the Workspace Owner of OneSpace. 
You speak directly, concisely, and professionally.

CRITICAL RULES:
1. ONLY answer exactly what the user asks for. Do NOT volunteer extra information.
2. If the user asks about something, just give them that specific number or detail. Do not summarize the entire workspace.
3. If the user's sentence is cut off or doesn't make sense, politely ask them to repeat or clarify.
4. Keep your response to 1-2 short sentences maximum.
5. Avoid markdown, lists, or long paragraphs because your response will be spoken aloud via text-to-speech.

Here is the current live data for the workspace:
- Branches: ${context?.branches || 0}
- Total Members: ${context?.totalMembers || 0}
- Current MRR: $${context?.mrr?.toLocaleString() || 0}
- Overall Risk Score: ${context?.averageRisk || 0}/100
- Open Support Tickets: ${context?.openTickets || 0}
- Overdue Invoices: ${context?.overdueInvoices || 0}
- Recent Visitors: ${context?.recentVisitors || 0}
- Total Bookings: ${context?.totalBookings || 0}
- Total Leads: ${context?.totalLeads || 0}
- Branch Performance: ${context?.branchPerformance?.join(" | ") || "N/A"}

Remember: Only answer what was explicitly asked.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to assist the owner." }],
        },
        ...(history || []).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      ],
      generationConfig: {
        maxOutputTokens: 150, // Keep responses short for voice
      },
    });

    const result = await chat.sendMessage([{ text: message }]);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI request" }, { status: 500 });
  }
}
