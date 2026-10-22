import { AssistantStructuredOutput, Priority, IdeaCategory } from "@/types/event";
import { fromMinorUnits, formatCurrency } from "@/lib/utils";

interface HeuristicContext {
  message: string;
  event: {
    id: string;
    name: string;
    eventType: string;
    date: string;
    location: string;
    guestCount: number;
    currency: any;
    budgetLimit: number;
    style: string;
    dietaryPreferences?: string;
    accessibilityNeeds?: string;
  };
  budgetSummary: {
    plannedTotal: number;
    actualTotal: number;
    remaining: number;
    budgetLimit: number;
    itemCount: number;
  };
  taskSummary: {
    totalCount: number;
    completedCount: number;
    overdueCount: number;
    pendingCount: number;
  };
  vendorSummary: {
    totalCount: number;
    bookedCount: number;
    toFindCount: number;
  };
}

export function generateHeuristicAssistantResponse(ctx: HeuristicContext): AssistantStructuredOutput {
  const q = ctx.message.toLowerCase();
  const eventName = ctx.event.name;
  const eventType = ctx.event.eventType;
  const guests = ctx.event.guestCount;
  const location = ctx.event.location;
  const budgetLimitStr = formatCurrency(ctx.event.budgetLimit, ctx.event.currency);
  const remainingStr = formatCurrency(ctx.budgetSummary.remaining, ctx.event.currency);
  const isOverBudget = ctx.budgetSummary.remaining < 0;

  // 1. "What should I do this month?" / "prioritize"
  if (q.includes("this month") || q.includes("prioritize") || q.includes("next step") || q.includes("what should i do")) {
    let focusPoints: string[] = [];

    if (ctx.taskSummary.overdueCount > 0) {
      focusPoints.push(`Resolve the **${ctx.taskSummary.overdueCount} overdue planning task(s)** first to prevent downstream booking delays.`);
    }

    if (ctx.vendorSummary.toFindCount > 0) {
      focusPoints.push(`Lock down contracts for your **${ctx.vendorSummary.toFindCount} open vendor category/categories**, as good dates fill quickly.`);
    }

    if (isOverBudget) {
      focusPoints.push(`Review your planned budget items: you are currently **${formatCurrency(Math.abs(ctx.budgetSummary.remaining), ctx.event.currency)} over your budget cap**.`);
    } else {
      focusPoints.push(`You currently have **${remainingStr} in unallocated reserve** from your total ${budgetLimitStr} budget.`);
    }

    if (ctx.event.dietaryPreferences) {
      focusPoints.push(`Verify dietary protocols (${ctx.event.dietaryPreferences}) are signed off in writing with your caterer.`);
    }

    const reply = `Here is your high-impact focus for **${eventName}** (${guests} guests):\n\n` +
      focusPoints.map((pt, i) => `${i + 1}. ${pt}`).join("\n") +
      `\n\nI have drafted actionable tasks below that you can review and add directly to your checklist.`;

    return {
      reply,
      planningTip: "Pro tip: Consolidate communications with vendors into one weekly batch rather than answering one-off emails throughout the work week.",
      suggestedTasks: [
        {
          title: `Vendor check-in & timeline alignment (${eventType})`,
          category: "Vendors",
          priority: "high" as Priority,
          dueDateOffsetDays: 7,
          notes: "Confirm arrival windows, load-in parking, and electrical power needs.",
        },
        {
          title: "Send RSVP reminder & guest diet confirmation",
          category: "Invitations",
          priority: "medium" as Priority,
          dueDateOffsetDays: 14,
          notes: `Check against dietary note: ${ctx.event.dietaryPreferences || "None noted yet"}`,
        },
      ],
      suggestedBudgetItems: [
        {
          title: "Contingency buffer for final headcount changes",
          category: "Contingency Reserve",
          plannedAmount: Math.round(fromMinorUnits(ctx.event.budgetLimit, ctx.event.currency) * 0.04),
          notes: "4% safety cushion for last-minute guest additions or extra service hours.",
        },
      ],
      suggestedIdeas: [
        {
          title: "Pre-event Shared Digital FAQ Page",
          category: "activities" as IdeaCategory,
          description: "Send a friendly single-page text link answering parking, dress code, weather expectations, and venue accessibility.",
          fitRationale: `Reduces day-of confusion for ${guests} attendees at ${location}.`,
          estimatedCostRange: "$0 (Free Google Doc or Notion)",
        },
      ],
    };
  }

  // 2. Reduce costs / budget optimization
  if (q.includes("cost") || q.includes("reduce") || q.includes("save money") || q.includes("budget") || q.includes("trim")) {
    const reply = `To optimize your budget without losing the warm, celebratory atmosphere of **${eventName}**:\n\n` +
      `1. **Focus on high-touch sensory elements**: Guests remember great food, clear music sound, and comfortable seating far more than uniform custom favors or excessive floral runners.\n` +
      `2. **Leverage cluster decor instead of room-wide fills**: Cluster candles, fairy lights, and potted greenery at key photo focal points (entrance, bar, main table) rather than spreading decor thinly.\n` +
      `3. **Review service formats**: Family-style platters or quality food trucks often cost 20-30% less than plated multi-course meals while feeling warmer and more conversational.\n` +
      `4. **BYO or specialized beverage menu**: Limiting the bar to 2 signature craft cocktails plus wine & beer significantly cuts liquor overhead compared to an open full bar.`;

    return {
      reply,
      planningTip: "Never cut corners on audio/sound reinforcement or weather contingency—cold or unheard guests leave early.",
      suggestedTasks: [
        {
          title: "Audit vendor quotes for redundant rental items",
          category: "Budget",
          priority: "high" as Priority,
          dueDateOffsetDays: 5,
          notes: "Check if the venue already provides basic tables, chairs, trash cans, or extension cords.",
        },
      ],
      suggestedBudgetItems: [
        {
          title: "Savings reallocated to Contingency Reserve",
          category: "Contingency Reserve",
          plannedAmount: 250,
          notes: "Saved by switching from individual floral centerpieces to reusable terracotta candle clusters.",
        },
      ],
      suggestedIdeas: [
        {
          title: "Potted Herb & Botanical Table Centerpieces",
          category: "decor" as IdeaCategory,
          description: "Use fragrant potted rosemary, sage, and mint plants wrapped in butcher paper. Guests or hosts take them home to plant afterwards.",
          fitRationale: "Costs under $8 per table compared to $60-$120 for cut florist arrangements, while smelling delightful.",
          estimatedCostRange: "$60 - $120 total",
        },
      ],
    };
  }

  // 3. Questions to ask caterer / vendors
  if (q.includes("ask") || q.includes("caterer") || q.includes("vendor") || q.includes("question")) {
    const reply = `Here are the essential questions to ask your caterer or food vendor for **${eventName}** (${guests} guests at ${location}):\n\n` +
      `1. **Dietary & Allergies**: How are severe allergies and dietary needs (${ctx.event.dietaryPreferences || "celiac, vegan, etc."}) handled in the prep kitchen to prevent cross-contamination?\n` +
      `2. **Staffing Ratio**: How many servers and bartenders are included for ${guests} guests? (Target 1 server per 20 guests for plated, 1 per 30 for buffet/family style).\n` +
      `3. **Load-in & Kitchen Facilities**: Does your quote assume an on-site commercial kitchen, or do you require prep tent rentals, water hookups, or dedicated 20A electrical circuits?\n` +
      `4. **Leftovers & Cleanup**: Do you pack up leftover food for the hosts? Is trash removal and post-event sweep included or an additional fee?\n` +
      `5. **Vendor Meals**: How many vendor meals (photographer, musicians, coordinator) need to be provided, and what is the discounted vendor rate?`;

    return {
      reply,
      planningTip: "Always request a tasting *before* making the final 50% payment, and take written photos of the sample presentation.",
      suggestedTasks: [
        {
          title: "Email dietary questionnaire & staffing checklist to caterer",
          category: "Food & Beverage",
          priority: "urgent" as Priority,
          dueDateOffsetDays: 3,
          notes: "Include final questions on trash removal and vendor meal pricing.",
        },
      ],
    };
  }

  // 4. Backyard / Birthday / Specific guest plan
  if (q.includes("backyard") || q.includes("birthday") || q.includes("plan for") || q.includes("suggest a plan")) {
    const reply = `Here is a tailored operational plan for a **${guests}-person celebration** with style **"${ctx.event.style}"**:\n\n` +
      `• **Arrival & First Hour**: Ambient background playlist, pre-poured signature greeting drink so guests aren't queued at the bar, and a low-key icebreaker (e.g. Polaroid wall or vinyl selection table).\n` +
      `• **Food Flow**: Stagger food service 45 minutes into the gathering once most guests arrive. Interactive station (like tacos or grazing boards) keeps movement dynamic.\n` +
      `• **Speech / Toast Window**: Keep toasts to 10 minutes total right as dessert or birthday cake is cut.\n` +
      `• **Lighting Transition**: Dim main overheads and let bistro strings and amber lamps take over as twilight approaches.\n` +
      `• **Wind-down & Good Neighbors**: Plan a gentle acoustic wind-down playlist for the final 45 minutes to ease guests toward exit without abrupt cutoff.`;

    return {
      reply,
      planningTip: "Restroom logistics rule: For 40+ people over 4 hours, ensure extra hand towels, premium hand wash, and extra paper are stocked before guests arrive.",
      suggestedTasks: [
        {
          title: "Restroom & hospitality prep kit (paper, towels, room spray)",
          category: "Logistics",
          priority: "high" as Priority,
          dueDateOffsetDays: 2,
          notes: "Stock up on pump soap, hand towels, and a small waste basket liner.",
        },
        {
          title: "Test outdoor sound levels at property boundary",
          category: "Entertainment",
          priority: "medium" as Priority,
          dueDateOffsetDays: 4,
          notes: "Walk to the sidewalk/street to ensure bass levels comply with local quiet hours.",
        },
      ],
      suggestedIdeas: [
        {
          title: "Signature Welcome Cocktail & Mocktail Dispenser",
          category: "food" as IdeaCategory,
          description: "Two 3-gallon glass drink dispensers on wooden risers with fresh citrus and herb garnishes for self-serve flow.",
          fitRationale: "Eliminates initial drink bottlenecks and looks gorgeous upon entry.",
          estimatedCostRange: "$40 - $70",
        },
      ],
    };
  }

  // 5. Checklist conversion / General response
  const reply = `Based on your event details for **${eventName}** (${ctx.event.eventType}, ${guests} guests, target budget ${budgetLimitStr}):\n\n` +
    `I've analyzed your current event state:\n` +
    `• **Budget**: ${formatCurrency(ctx.budgetSummary.plannedTotal, ctx.event.currency)} planned across ${ctx.budgetSummary.itemCount} items, leaving ${remainingStr}.\n` +
    `• **Tasks**: ${ctx.taskSummary.completedCount}/${ctx.taskSummary.totalCount} completed (${ctx.taskSummary.overdueCount} overdue).\n` +
    `• **Style & Needs**: ${ctx.event.style}. ${ctx.event.accessibilityNeeds ? `Accessibility: ${ctx.event.accessibilityNeeds}.` : ""}\n\n` +
    `Regarding your question: "${ctx.message}"\n\n` +
    `I have compiled concrete suggestions below tailored to ${ctx.event.location}. Review the items and click **"Add Selected to Event Plan"** to incorporate them directly into your timeline, budget, or ideas!`;

  return {
    reply,
    planningTip: "Organizing in small, consistent 20-minute daily sprints keeps event momentum steady without overwhelming your weekend.",
    suggestedTasks: [
      {
        title: `Follow up regarding: ${ctx.message.slice(0, 45)}...`,
        category: "Planning",
        priority: "medium" as Priority,
        dueDateOffsetDays: 5,
        notes: `Generated from assistant discussion on ${new Date().toLocaleDateString()}`,
      },
    ],
    suggestedBudgetItems: [
      {
        title: `Estimated budget item for ${ctx.event.eventType}`,
        category: "Logistics & Rentals",
        plannedAmount: 120,
        notes: "Subject to vendor quote verification.",
      },
    ],
    suggestedIdeas: [
      {
        title: "Personalized Guest Thank-You Cards",
        category: "favors" as IdeaCategory,
        description: "Handwritten note cards placed at place settings expressing gratitude for each guest's friendship and support.",
        fitRationale: `Deeply memorable, personal touch that requires almost zero financial investment for ${guests} guests.`,
        estimatedCostRange: "$20 - $40",
      },
    ],
  };
}
