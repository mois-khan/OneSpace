import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { memberName, company, monthsAsMember, daysSinceLastVisit, planType } = await request.json();

    const apiKey = process.env.GEMNINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an AI assistant for CS Coworking, a premium coworking space in India.
      Write a short, warm, and highly personalized retention email to a member who is at risk of churning.

      Member Details:
      - Name: ${memberName}
      - Company: ${company || 'Independent Professional'}
      - Plan: ${planType}
      - Membership duration: ${monthsAsMember} months
      - Recent activity: Has not visited the space in ${daysSinceLastVisit} days.

      Instructions:
      1. Be warm and professional, not accusatory about their absence.
      2. Mention their specific tenure (${monthsAsMember} months) to show we value their loyalty.
      3. Subtly acknowledge we haven't seen them much lately.
      4. Offer a specific perk to invite them back (e.g., free conference room hours, a free guest pass, or an invite to an upcoming community lunch).
      5. Keep it concise (3-4 short paragraphs).
      6. Return ONLY the body of the email. Do not include the subject line or introductory text like "Here is the email:".
      7. Sign off from "Abhijeet, Community Manager at CS Coworking".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      subject: `We value you, ${memberName.split(' ')[0]} — let's talk about your space at CS Coworking`,
      body: text.trim() 
    });

  } catch (error) {
    console.error("Error generating AI email:", error);
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 });
  }
}
