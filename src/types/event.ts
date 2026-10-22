import { z } from "zod";

export type EventType = "wedding" | "birthday" | "community" | "dinner" | "celebration" | "other";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR" | "JPY";

export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskSource = "manual" | "ai_suggested" | "template";

export type BudgetPaymentStatus = "unpaid" | "deposit_paid" | "paid_in_full";

export type VendorStatus = "to_find" | "contacted" | "quote_received" | "booked" | "not_proceeding";

export type IdeaCategory = "themes" | "decor" | "food" | "activities" | "favors" | "weather_backup" | "entertainment" | "other";
export type IdeaState = "browsing" | "saved" | "dismissed";

export interface EventProfile {
  id: string;
  displayName: string;
  email?: string;
  defaultCurrency: CurrencyCode;
}

export interface EventItem {
  id: string;
  ownerId: string;
  name: string;
  eventType: EventType;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm
  timeZone: string;
  location: string;
  guestCount: number;
  currency: CurrencyCode;
  budgetLimit: number; // Stored in minor units (e.g. cents: $5000 = 500000)
  style: string; // e.g. "Rustic Botanical", "Retro Disco 90s", "Warm Neighborhood Picnic"
  notes?: string;
  dietaryPreferences?: string; // e.g. "Gluten-free, vegan options, peanut allergy"
  accessibilityNeeds?: string; // e.g. "Step-free wheelchair ramp, quiet room"
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string; // e.g. "Venue", "Food & Beverage", "Attire & Beauty", "Decor & Florals", "Entertainment & Music", "Photography", "Logistics", "Permits", "Contingency"
  title: string;
  plannedAmount: number; // minor units
  actualAmount: number; // minor units
  paymentStatus: BudgetPaymentStatus;
  dueDate?: string; // YYYY-MM-DD
  notes?: string;
  vendorId?: string; // optional linked vendor
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  category: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  assignee?: string;
  source: TaskSource;
  milestonePhase?: string; // e.g. "6+ Months Out", "2-3 Months Out", "1 Month Out", "Week Of", "Day Of"
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorItem {
  id: string;
  eventId: string;
  type: string; // e.g. "Venue", "Catering", "Photography", "DJ / Band", "Florist", "Rentals", "Officiant", "Permits & Safety"
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  status: VendorStatus;
  quotedAmount: number; // minor units
  followUpDate?: string; // YYYY-MM-DD
  notes?: string;
  linkedTaskIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IdeaItem {
  id: string;
  eventId: string;
  category: IdeaCategory;
  title: string;
  description: string;
  fitRationale: string;
  estimatedCostRange: string; // e.g. "$150 - $300"
  state: IdeaState;
  source: "ai" | "curated" | "user";
  createdAt: string;
}

export interface TaskDraft {
  title: string;
  category: string;
  priority: Priority;
  dueDateOffsetDays: number; // relative to event date or today
  notes?: string;
}

export interface BudgetItemDraft {
  title: string;
  category: string;
  plannedAmount: number; // in standard currency units (dollars/euros)
  notes?: string;
}

export interface IdeaDraft {
  title: string;
  category: IdeaCategory;
  description: string;
  fitRationale: string;
  estimatedCostRange: string;
}

export interface AssistantStructuredOutput {
  reply: string;
  suggestedTasks?: TaskDraft[];
  suggestedBudgetItems?: BudgetItemDraft[];
  suggestedIdeas?: IdeaDraft[];
  followUpQuestion?: string;
  planningTip?: string;
}

export interface AssistantMessage {
  id: string;
  eventId: string;
  role: "user" | "assistant" | "system";
  content: string;
  structuredOutput?: AssistantStructuredOutput;
  timestamp: string;
}

// Zod schemas for validation
export const EventSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters"),
  eventType: z.enum(["wedding", "birthday", "community", "dinner", "celebration", "other"]),
  date: z.string().min(4, "Event date is required"),
  time: z.string().optional(),
  timeZone: z.string().default("America/New_York"),
  location: z.string().min(2, "Location is required"),
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY"]).default("USD"),
  budgetLimit: z.number().min(0, "Budget must be 0 or greater"),
  style: z.string().default("Warm & Celebratory"),
  notes: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
});

export const BudgetItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  plannedAmount: z.number().min(0, "Planned amount must be non-negative"),
  actualAmount: z.number().min(0, "Actual amount must be non-negative"),
  paymentStatus: z.enum(["unpaid", "deposit_paid", "paid_in_full"]),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  vendorId: z.string().optional(),
});

export const TaskItemSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  category: z.string().min(1, "Category is required"),
  dueDate: z.string().min(4, "Due date is required"),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  status: z.enum(["todo", "in_progress", "completed"]),
  notes: z.string().optional(),
  assignee: z.string().optional(),
});

export const VendorItemSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  type: z.string().min(1, "Vendor type is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  status: z.enum(["to_find", "contacted", "quote_received", "booked", "not_proceeding"]),
  quotedAmount: z.number().min(0).default(0),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const AssistantRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  event: z.object({
    id: z.string(),
    name: z.string(),
    eventType: z.string(),
    date: z.string(),
    location: z.string(),
    guestCount: z.number(),
    currency: z.string(),
    budgetLimit: z.number(),
    style: z.string(),
    dietaryPreferences: z.string().optional(),
    accessibilityNeeds: z.string().optional(),
  }),
  budgetSummary: z.object({
    plannedTotal: z.number(),
    actualTotal: z.number(),
    remaining: z.number(),
    budgetLimit: z.number(),
    itemCount: z.number(),
  }),
  taskSummary: z.object({
    totalCount: z.number(),
    completedCount: z.number(),
    overdueCount: z.number(),
    pendingCount: z.number(),
  }),
  vendorSummary: z.object({
    totalCount: z.number(),
    bookedCount: z.number(),
    toFindCount: z.number(),
  }),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional(),
});
