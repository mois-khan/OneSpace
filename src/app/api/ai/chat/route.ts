import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  type FunctionDeclaration,
  type Part,
} from "@google/generative-ai";
import { ROLE_META, ROLE_TOOLS, TOOL_REGISTRY, type ToolName } from "@/lib/ai/rbac";
import { TOOL_HANDLERS, type SuggestedAction } from "@/lib/ai/tools";
import type { ChatSnapshot } from "@/lib/ai/snapshot";
import type { UserRole } from "@/types";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  user: {
    name: string;
    role: UserRole;
    branchScope: string;
  };
  snapshot: ChatSnapshot;
}

const MAX_TOOL_TURNS = 4;

function buildSystemPrompt(req: ChatRequest): string {
  const meta = ROLE_META[req.user.role];
  const dateLabel = new Date(req.snapshot.now).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const branchLine =
    req.user.branchScope === "all"
      ? "You may discuss any branch."
      : `You are bound to a single branch: ${
          req.snapshot.branches.find((b) => b.id === req.user.branchScope)?.name ||
          req.user.branchScope
        } (${req.user.branchScope}). Politely decline questions about other branches.`;

  // Headline numbers for the system prompt so the model can answer simple
  // questions without invoking tools.
  const kpis = req.snapshot.kpis;
  const branchSummary = req.snapshot.branchPerformance
    .map(
      (b) =>
        `- ${b.name}: ${b.members} members, ${formatINR(b.mrr)} MRR, ${
          b.occupancy
        }% occupancy, ${b.overdue} overdue, health=${b.health}`,
    )
    .join("\n");

  return `You are OneSpace's operational intelligence assistant for ${
    req.user.name
  } (${meta.description}).

Today is ${dateLabel}.

ROLE & SCOPE
${meta.scopeNote}
${branchLine}

HEADLINE NUMBERS (today, already scoped to ${req.user.branchScope})
- Occupancy: ${kpis.occupancy}%
- MRR: ${formatINR(kpis.mrr)}
- At-risk MRR: ${formatINR(kpis.atRiskMrr)} across ${kpis.highRiskCount} high-risk members
- Overdue invoices: ${kpis.overdueInvoices} (${formatINR(kpis.overdueAmount)})
- Renewals due in 7 days: ${kpis.renewalsDueIn7Days}
- Renewals due in 30 days: ${kpis.renewalsDueIn30Days}
- Active members: ${kpis.activeMembers}
- Visitors today: ${kpis.visitorsToday}

BRANCH SNAPSHOT
${branchSummary || "(no branches in scope)"}

HOW TO ANSWER
1. Be concise. Default to 1–3 short paragraphs or a compact bullet list. Never wall-of-text.
2. Use Indian Rupee formatting (₹) for money. Use "k"/"L" abbreviations for large numbers (e.g., ₹12.5L).
3. When the user asks about specific members, leads, invoices, or visitors — call the relevant tool to look them up rather than guessing.
4. When you find that an action would help (a renewal due, an outreach email, a visitor to log), call the matching suggest_* tool so the user gets a clickable action chip. Do not invent suggestions for things that have no matching tool.
5. NEVER fabricate numbers. If a metric isn't in scope or you can't compute it, say so plainly.
6. If asked about something outside this user's role/scope, decline politely and explain what you can help with instead.
7. End with one suggested follow-up question or action when appropriate.`;
}

function formatINR(amount: number): string {
  if (amount >= 10_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}k`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildFunctionDeclarations(role: UserRole): FunctionDeclaration[] {
  return ROLE_TOOLS[role].map((name) => {
    const tool = TOOL_REGISTRY[name];
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters as unknown as FunctionDeclaration["parameters"],
    };
  });
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.messages?.length) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }
  if (!body.user?.role) {
    return NextResponse.json({ error: "user.role required" }, { status: 400 });
  }
  if (!body.snapshot) {
    return NextResponse.json({ error: "snapshot required" }, { status: 400 });
  }

  const apiKey = process.env.GEMNINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured (GEMNINI_API_KEY)" },
      { status: 500 },
    );
  }

  const allowedTools = new Set<ToolName>(ROLE_TOOLS[body.user.role]);
  const branchLock = body.user.branchScope;

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemInstruction = buildSystemPrompt(body);
  const tools = [{ functionDeclarations: buildFunctionDeclarations(body.user.role) }];

  const primaryModel = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction,
    tools,
  });

  const fallbackModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction,
    tools,
  });

  // Convert message history into Gemini's format. The trailing user message
  // is sent via sendMessage(); everything before that becomes history.
  const history = body.messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
  const lastUser = body.messages[body.messages.length - 1];
  if (lastUser.role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from the user" },
      { status: 400 },
    );
  }

  const suggestions: SuggestedAction[] = [];

  const attemptChat = async (modelInstance: ReturnType<typeof genAI.getGenerativeModel>) => {
    const chat = modelInstance.startChat({ history });
    let pendingInput: string | Part[] = lastUser.content;
    let response;

    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      const result = await chat.sendMessage(pendingInput);
      response = result.response;
      const calls = response.functionCalls();

      if (!calls || calls.length === 0) break;

      // Execute every tool call in this turn; collect parts for the next round.
      const responseParts: Part[] = calls.map((call) => {
        const name = call.name as ToolName;
        if (!allowedTools.has(name)) {
          return {
            functionResponse: {
              name: call.name,
              response: {
                error:
                  "This action isn't available to your role. Acknowledge the limit politely.",
              },
            },
          };
        }
        const handler = TOOL_HANDLERS[name];
        if (!handler) {
          return {
            functionResponse: {
              name: call.name,
              response: { error: `Unknown tool: ${name}` },
            },
          };
        }
        const args = (call.args || {}) as Record<string, unknown>;
        const { data, suggestions: emitted } = handler(args, {
          snapshot: body.snapshot,
          branchLock,
        });
        if (emitted) suggestions.push(...emitted);
        return {
          functionResponse: { name: call.name, response: data as object },
        };
      });

      pendingInput = responseParts;
    }
    return response?.text() || "";
  };

  try {
    let text = "";
    try {
      text = await attemptChat(primaryModel);
    } catch (primaryError) {
      console.warn("Primary model failed, falling back to gemini-3.5-flash", primaryError);
      text = await attemptChat(fallbackModel);
    }

    return NextResponse.json({
      message: { role: "assistant", content: text.trim() },
      suggestions,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
