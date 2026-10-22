import { EventType, CurrencyCode, Priority, IdeaCategory } from "@/types/event";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "USD", label: "US Dollar ($)", symbol: "$" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "GBP", label: "British Pound (£)", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar (CA$)", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { code: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { code: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
];

export const EVENT_TYPES: { type: EventType; label: string; icon: string; description: string; defaultBudget: number; defaultGuests: number }[] = [
  {
    type: "wedding",
    label: "Wedding",
    icon: "HeartHandshake",
    description: "Ceremony, reception, rehearsals, and celebration with family & friends",
    defaultBudget: 2500000, // $25,000
    defaultGuests: 110,
  },
  {
    type: "birthday",
    label: "Birthday Party",
    icon: "Cake",
    description: "Milestone birthdays, intimate gatherings, rooftop or backyard bashes",
    defaultBudget: 350000, // $3,500
    defaultGuests: 35,
  },
  {
    type: "community",
    label: "Community Event",
    icon: "Users",
    description: "Block parties, seasonal festivals, neighborhood markets, and fundraisers",
    defaultBudget: 600000, // $6,000
    defaultGuests: 180,
  },
  {
    type: "dinner",
    label: "Dinner Gathering",
    icon: "Utensils",
    description: "Pop-up dinners, anniversary celebrations, and holiday feasts",
    defaultBudget: 150000, // $1,500
    defaultGuests: 18,
  },
  {
    type: "celebration",
    label: "Milestone Celebration",
    icon: "Sparkles",
    description: "Retirement, graduation, baby shower, or product launch party",
    defaultBudget: 400000, // $4,000
    defaultGuests: 50,
  },
];

export const BUDGET_CATEGORIES = [
  "Venue & Space",
  "Food & Beverage",
  "Attire & Styling",
  "Decor & Florals",
  "Entertainment & Audio",
  "Photography & Video",
  "Logistics & Rentals",
  "Permits & Safety",
  "Favors & Gifts",
  "Contingency Reserve",
  "Other",
] as const;

export const VENDOR_TYPES_BY_EVENT: Record<EventType, string[]> = {
  wedding: [
    "Venue",
    "Catering & Bar",
    "Photography & Video",
    "DJ / Live Music",
    "Florals & Greenery",
    "Cake & Desserts",
    "Officiant",
    "Hair & Makeup",
    "Rentals (Tents, Chairs)",
    "Transportation",
  ],
  birthday: [
    "Venue / Private Room",
    "Catering / Food Trucks",
    "DJ / Audio",
    "Cake / Bakery",
    "Balloons & Custom Decor",
    "Photographer",
    "Party Rentals & Games",
    "Bartender",
  ],
  community: [
    "Park / Public Venue",
    "Permits & City Safety",
    "Stage & Sound System",
    "Food Trucks & Stalls",
    "Waste Management & Porta-potties",
    "Event Security / EMT",
    "Local Performers / Band",
    "Print & Signage",
    "Canopies & Tables",
  ],
  dinner: [
    "Private Dining / Chef",
    "Wine & Beverage",
    "Florals & Tableware",
    "Acoustic Musician",
  ],
  celebration: [
    "Venue",
    "Catering",
    "Audio / Projector",
    "Photographer",
    "Decorations & Signage",
  ],
  other: [
    "Venue",
    "Catering",
    "Entertainment",
    "Rentals",
    "Permits",
  ],
};

export const IDEA_CATEGORIES: { id: IdeaCategory; label: string }[] = [
  { id: "themes", label: "Themes & Vibe" },
  { id: "decor", label: "Decor & Lighting" },
  { id: "food", label: "Food & Drinks" },
  { id: "activities", label: "Activities & Games" },
  { id: "favors", label: "Gifts & Favors" },
  { id: "weather_backup", label: "Weather & Backup" },
  { id: "entertainment", label: "Music & Playlists" },
];

export const ASSISTANT_STARTER_PROMPTS = [
  "What should I prioritize this month?",
  "Suggest a 40-person backyard birthday plan",
  "Where could I reduce costs without losing the vibe?",
  "What questions should I ask my caterer?",
  "Help me create a rain & inclement weather backup plan",
  "Suggest interactive guest activities that aren't cheesy",
];

// Starter Task Templates by Event Type
export interface StarterMilestoneTemplate {
  title: string;
  category: string;
  priority: Priority;
  daysBeforeEvent: number; // e.g. 180 means 6 months before
  milestonePhase: string;
  notes: string;
}

export const STARTER_TASKS_BY_EVENT: Record<EventType, StarterMilestoneTemplate[]> = {
  wedding: [
    {
      title: "Set guest list count and establish target budget",
      category: "Planning",
      priority: "urgent",
      daysBeforeEvent: 240,
      milestonePhase: "8+ Months Out",
      notes: "Lock down maximum guest capacity before touring venues.",
    },
    {
      title: "Book ceremony and reception venue",
      category: "Venue",
      priority: "urgent",
      daysBeforeEvent: 210,
      milestonePhase: "7+ Months Out",
      notes: "Confirm curfew, alcohol licensing, sound limitations, and backup weather space.",
    },
    {
      title: "Secure caterer and draft menu tasting",
      category: "Food & Beverage",
      priority: "high",
      daysBeforeEvent: 180,
      milestonePhase: "6 Months Out",
      notes: "Account for dietary needs (gluten-free, vegan, nut allergies).",
    },
    {
      title: "Hire photographer & videographer",
      category: "Photography & Video",
      priority: "high",
      daysBeforeEvent: 150,
      milestonePhase: "5 Months Out",
      notes: "Review full wedding galleries, not just Instagram highlights.",
    },
    {
      title: "Mail Save-the-Dates to out-of-town guests",
      category: "Invitations",
      priority: "medium",
      daysBeforeEvent: 120,
      milestonePhase: "4 Months Out",
      notes: "Include event website and travel accommodation blocks.",
    },
    {
      title: "Book florist and confirm decor vision board",
      category: "Decor & Florals",
      priority: "medium",
      daysBeforeEvent: 90,
      milestonePhase: "3 Months Out",
      notes: "Prioritize focal points like ceremony arch and head table.",
    },
    {
      title: "Send formal invitations with RSVP deadline",
      category: "Invitations",
      priority: "high",
      daysBeforeEvent: 60,
      milestonePhase: "2 Months Out",
      notes: "Set RSVP deadline for 30 days prior to event.",
    },
    {
      title: "Submit final headcount and dietary restrictions to caterer",
      category: "Food & Beverage",
      priority: "urgent",
      daysBeforeEvent: 21,
      milestonePhase: "3 Weeks Out",
      notes: "Ensure vendor meals (photographer, DJ) are counted.",
    },
    {
      title: "Finalize run-of-show day timeline & share with bridal party",
      category: "Timeline",
      priority: "urgent",
      daysBeforeEvent: 7,
      milestonePhase: "Week Of",
      notes: "Distribute phone contact list for all day-of coordinators.",
    },
    {
      title: "Pack wedding emergency kit & vendor payment tips envelopes",
      category: "Logistics",
      priority: "high",
      daysBeforeEvent: 2,
      milestonePhase: "Days Before",
      notes: "Include lint roller, safety pins, pain relievers, stain remover pen.",
    },
  ],
  birthday: [
    {
      title: "Choose venue or confirm private home setup",
      category: "Venue",
      priority: "urgent",
      daysBeforeEvent: 45,
      milestonePhase: "6 Weeks Out",
      notes: "Check speaker systems, parking, and weather shelter.",
    },
    {
      title: "Send digital invitations & track RSVPs",
      category: "Invitations",
      priority: "high",
      daysBeforeEvent: 30,
      milestonePhase: "1 Month Out",
      notes: "Include gift preference or 'no gifts' note clearly.",
    },
    {
      title: "Order custom cake or special dessert table",
      category: "Food & Beverage",
      priority: "high",
      daysBeforeEvent: 20,
      milestonePhase: "3 Weeks Out",
      notes: "Confirm delivery window and refrigerating requirements.",
    },
    {
      title: "Curate upbeat celebration playlist & check sound equipment",
      category: "Entertainment",
      priority: "medium",
      daysBeforeEvent: 10,
      milestonePhase: "10 Days Out",
      notes: "Prepare 4-5 hours of seamless background to dancing music.",
    },
    {
      title: "Buy drinks, ice, bar garnishes, and disposable compostable tableware",
      category: "Logistics",
      priority: "medium",
      daysBeforeEvent: 4,
      milestonePhase: "Week Of",
      notes: "Rule of thumb: 1.5 drinks per person per hour + 1 lb of ice per person.",
    },
    {
      title: "Decor setup & photo backdrop lighting test",
      category: "Decor",
      priority: "high",
      daysBeforeEvent: 1,
      milestonePhase: "Day Before",
      notes: "Hang banners, test string lights, and position photo-op space.",
    },
  ],
  community: [
    {
      title: "Submit municipal public gathering permit & park reservation",
      category: "Permits & Safety",
      priority: "urgent",
      daysBeforeEvent: 90,
      milestonePhase: "3 Months Out",
      notes: "Requires street closure notice and certificate of liability insurance.",
    },
    {
      title: "Recruit volunteer committee leads (logistics, welcome, cleanup)",
      category: "Volunteers",
      priority: "high",
      daysBeforeEvent: 60,
      milestonePhase: "2 Months Out",
      notes: "Schedule brief bi-weekly 20-minute check-in calls.",
    },
    {
      title: "Confirm food truck permits, food safety compliance, and power outlets",
      category: "Food & Stalls",
      priority: "high",
      daysBeforeEvent: 40,
      milestonePhase: "6 Weeks Out",
      notes: "Ensure food trucks have quiet generators or access to 220V shore power.",
    },
    {
      title: "Rent stage, PA sound system, portable restrooms, and recycling bins",
      category: "Logistics",
      priority: "urgent",
      daysBeforeEvent: 30,
      milestonePhase: "1 Month Out",
      notes: "Book delivery time window for 3 hours before gates open.",
    },
    {
      title: "Distribute neighborhood flyers, posters, and social media blast",
      category: "Promotions",
      priority: "medium",
      daysBeforeEvent: 21,
      milestonePhase: "3 Weeks Out",
      notes: "Provide clear parking instructions, transit lines, and accessible access paths.",
    },
    {
      title: "Conduct site safety walkthrough & verify first aid station",
      category: "Safety",
      priority: "high",
      daysBeforeEvent: 3,
      milestonePhase: "Week Of",
      notes: "Locate fire extinguishers, emergency exits, and volunteer central booth.",
    },
  ],
  dinner: [
    {
      title: "Finalize menu and wine pairing with chef",
      category: "Food & Beverage",
      priority: "high",
      daysBeforeEvent: 14,
      milestonePhase: "2 Weeks Out",
      notes: "Inquire about guest dietary preferences.",
    },
    {
      title: "Tableware, linen, and glassware inventory check",
      category: "Decor & Dining",
      priority: "medium",
      daysBeforeEvent: 7,
      milestonePhase: "1 Week Out",
      notes: "Ensure sufficient charger plates, water goblets, and napkins.",
    },
  ],
  celebration: [
    {
      title: "Reserve venue & arrange catering package",
      category: "Venue",
      priority: "urgent",
      daysBeforeEvent: 45,
      milestonePhase: "6 Weeks Out",
      notes: "Confirm AV / speech microphone setup.",
    },
    {
      title: "Design slide tribute / photo memory wall",
      category: "Entertainment",
      priority: "medium",
      daysBeforeEvent: 14,
      milestonePhase: "2 Weeks Out",
      notes: "Collect high-res photos from friends and colleagues.",
    },
  ],
  other: [
    {
      title: "Define event vision and invite attendees",
      category: "Planning",
      priority: "urgent",
      daysBeforeEvent: 30,
      milestonePhase: "1 Month Out",
      notes: "Outline overall timeline and budget allocations.",
    },
  ],
};
