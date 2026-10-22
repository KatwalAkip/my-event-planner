import { NextRequest, NextResponse } from "next/server";
import { AssistantRequestSchema, AssistantStructuredOutput } from "@/types/event";
import { generateHeuristicAssistantResponse } from "@/lib/services/ai-engine";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AssistantRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, event, budgetSummary, taskSummary, vendorSummary } = parsed.data;

    // Check if an OpenAI key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const systemPrompt = `You are Gatherwise, a warm, calm, highly capable event planning assistant.
You are helping organize an event with the following context:
- Name: ${event.name}
- Type: ${event.eventType}
- Date: ${event.date}
- Location: ${event.location}
- Guests: ${event.guestCount}
- Currency: ${event.currency}
- Budget Cap: ${event.budgetLimit / 100} ${event.currency}
- Planned Budget: ${budgetSummary.plannedTotal / 100} ${event.currency}
- Remaining Budget: ${budgetSummary.remaining / 100} ${event.currency}
- Overdue Tasks: ${taskSummary.overdueCount}
- Pending Vendors: ${vendorSummary.toFindCount}
- Style & Vibe: ${event.style}
- Dietary Notes: ${event.dietaryPreferences || "None"}
- Accessibility Needs: ${event.accessibilityNeeds || "None"}

Guidelines:
1. Always keep advice grounded in the event's stated context.
2. Tone: Warm, calm, practical, and organized.
3. If proposing concrete steps, provide them in your reply and optionally suggest specific structured tasks or budget items.
4. Output JSON adhering to this structure:
{
  "reply": "string (markdown supported)",
  "planningTip": "string (optional short tip)",
  "suggestedTasks": [ { "title": "string", "category": "string", "priority": "urgent"|"high"|"medium"|"low", "dueDateOffsetDays": number, "notes": "string" } ],
  "suggestedBudgetItems": [ { "title": "string", "category": "string", "plannedAmount": number (in standard currency units), "notes": "string" } ],
  "suggestedIdeas": [ { "title": "string", "category": "themes"|"decor"|"food"|"activities"|"favors"|"weather_backup"|"entertainment"|"other", "description": "string", "fitRationale": "string", "estimatedCostRange": "string" } ]
}
Return ONLY valid JSON.`;

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt,
          prompt: message,
        });

        // Attempt to parse JSON response
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const output: AssistantStructuredOutput = JSON.parse(cleanText);

        return NextResponse.json({
          source: "openai",
          output,
        });
      } catch (aiErr) {
        console.warn("Live OpenAI generation failed or timed out, falling back to local heuristic engine:", aiErr);
        // Fallback gracefully below
      }
    }

    // High quality offline heuristic fallback
    const heuristicOutput = generateHeuristicAssistantResponse({
      message,
      event: event as any,
      budgetSummary,
      taskSummary,
      vendorSummary,
    });

    return NextResponse.json({
      source: "local-heuristic",
      output: heuristicOutput,
    });
  } catch (err: any) {
    console.error("Assistant API error:", err);
    return NextResponse.json(
      { error: "Internal server error while processing planning assistant request." },
      { status: 500 }
    );
  }
}
