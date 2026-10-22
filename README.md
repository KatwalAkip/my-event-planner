# Gatherwise 🌿

**A calm, GenAI-powered planning assistant for weddings, birthdays, and community events.**

Gatherwise brings budgets, adaptive milestone timelines, vendor coordination, and personalized ideas into one unified, trustworthy workspace. Designed for first-time planners organizing an intimate birthday as well as groups coordinating larger weddings or community festivals.

---

## Key Features

- **Welcome & Onboarding**: Explore pre-populated demo scenarios or use the guided, skippable event wizard to create new gatherings.
- **Event Dashboard**: Immediate visibility into countdowns, guest count, location, total budget spent/remaining, task completion %, and a prioritized **Recommended Next Step** action card.
- **Disciplined Budget Planner**:
  - Full categorization (Venue, Catering, Attire, Decor, Entertainment, Photography, Logistics, Permits, Contingency).
  - Explicit distinction between planned estimates and actual paid expenses.
  - Over-budget warning banner that warns when planned costs exceed limits without silently altering financial data.
  - Multi-currency formatting (USD, EUR, GBP, CAD, AUD, INR, JPY) in integer minor units.
- **Adaptive Milestones & Tasks**:
  - Dual viewing modes: **Chronological Milestone View** (categorized by phase: Overdue, Upcoming This Week, Next 30 Days, Later) and **Monthly Calendar Grid View**.
  - Confetti micro-celebrations upon completing milestones.
  - Automatic starter milestone generation based on event type.
  - Date adjustment with optional relative milestone recalculation that preserves user edits and assignees.
- **Vendor Coordination Checklist**:
  - Complete status pipeline: *To Find*, *Contacted*, *Quote Received*, *Booked*, and *Not Proceeding*.
  - Track contacts, quoted amounts, notes, and follow-up deadlines with action alerts.
  - 1-click **Convert Quote to Budget Item** to sync contracted prices into your budget.
  - No synthetic directory spam; strictly tracks your real vendor conversations.
- **Personalized Ideas Spotlight**:
  - Curated, browsable concepts across Themes, Decor & Lighting, Food & Drinks, Activities, Gifts & Favors, and Weather Contingencies.
  - Tailored to event details (guest count, budget tier, location, style notes, and accessibility needs).
  - Transparent estimated cost ranges and 1-click &ldquo;Add to Tasks&rdquo; or &ldquo;Add to Budget&rdquo;.
- **Context-Aware Planning Assistant**:
  - Dedicated conversational assistant with active awareness of the selected event's date, location, budget limits, overdue tasks, and pending vendors.
  - Quick prompt chips for high-impact questions:
    - *&ldquo;What should I prioritize this month?&rdquo;*
    - *&ldquo;Where could I reduce costs without losing the feel of the event?&rdquo;*
    - *&ldquo;Suggest a plan for a 40-person backyard birthday.&rdquo;*
    - *&ldquo;What should I ask a caterer?&rdquo;*
  - **Actionable Proposal Review Cards**: The assistant suggests structured tasks, budget items, and ideas that users can review, check/uncheck, and approve before anything is added.
- **Pre-Seeded Realistic Demo Scenarios**:
  1. *Maya & Elena's Botanical Garden Wedding* (115 guests, $28,000 budget, San Francisco, CA)
  2. *Leo's 30th Rooftop Vinyl & Taco Bash* (42 guests, $3,800 budget, Brooklyn, NY)
  3. *Oakridge Harvest Green Community Fair* (260 attendees, $6,500 budget, Austin, TX)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack) & React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & custom design tokens (warm neutral canvas `#FAF8F5`, deep ink text `#1C1917`, terracotta `#B84E33`, and evergreen `#256345`)
- **Typography**: Google Fonts (Inter + Playfair Display)
- **Icons**: Lucide Icons
- **Validation**: Zod (form schemas and structured assistant validation)
- **AI Engine**: Vercel AI SDK (`ai`, `@ai-sdk/openai`) with an intelligent, offline heuristic fallback engine
- **Database / Auth**: Supabase Postgres & Auth ready (includes full schema with Row Level Security in `supabase/schema.sql`)
- **Persistence**: Unified `EventStore` interface with automatic local demo mode (`localStorage`) and seamless Supabase cloud support

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

Gatherwise works completely out of the box in **Demo Mode** with persistent browser storage and an intelligent offline AI planner. No API keys are required to test or run the application.

If you wish to connect live OpenAI models or Supabase cloud storage, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
# Optional: Supabase Postgres & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...

# Optional: Live OpenAI Model Calls (GPT-4o-mini)
OPENAI_API_KEY=sk-proj-...
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## Supabase Schema & Row Level Security (RLS)

If you connect a Supabase project, execute the SQL script located at [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. It creates:

- `profiles` table with user display names and currency settings
- `events` table with owner scoping and foreign keys
- `budget_items` table linked to events
- `tasks` table with priorities, statuses, and milestone phases
- `vendors` table tracking contact info and quote statuses
- `ideas` table for saved and curated concepts
- `assistant_messages` table storing conversation history and structured proposal outputs
- Full Row Level Security (RLS) policies enforcing that users can only read and modify records for events they own.

---

## Verification & Testing

- **Production Build**: Verified with Next.js Turbopack (`npm run build`), generating static pages and dynamic assistant API routes without errors.
- **Server Health**: Verified with HTTP 200 responses on `http://localhost:3000`.
- **API Tests**: Verified `/api/assistant` endpoint with structured JSON responses, contextual recommendations, and proposed checklist/budget outputs.
- **Storage Resilience**: Tested local demo storage persistence across page reloads and multiple events.
