import { EventItem, BudgetItem, TaskItem, VendorItem, IdeaItem, AssistantMessage } from "@/types/event";
import { DEMO_EVENTS, DEMO_BUDGET_ITEMS, DEMO_TASKS, DEMO_VENDORS, DEMO_IDEAS, DEMO_ASSISTANT_MESSAGES } from "@/lib/demo-data";

export interface EventStore {
  isDemoMode(): boolean;
  getEvents(): Promise<EventItem[]>;
  getEvent(id: string): Promise<EventItem | null>;
  saveEvent(event: EventItem): Promise<EventItem>;
  deleteEvent(id: string): Promise<void>;

  getBudgetItems(eventId: string): Promise<BudgetItem[]>;
  saveBudgetItem(item: BudgetItem): Promise<BudgetItem>;
  deleteBudgetItem(id: string): Promise<void>;

  getTasks(eventId: string): Promise<TaskItem[]>;
  saveTask(task: TaskItem): Promise<TaskItem>;
  deleteTask(id: string): Promise<void>;

  getVendors(eventId: string): Promise<VendorItem[]>;
  saveVendor(vendor: VendorItem): Promise<VendorItem>;
  deleteVendor(id: string): Promise<void>;

  getIdeas(eventId: string): Promise<IdeaItem[]>;
  saveIdea(idea: IdeaItem): Promise<IdeaItem>;
  deleteIdea(id: string): Promise<void>;

  getMessages(eventId: string): Promise<AssistantMessage[]>;
  saveMessage(msg: AssistantMessage): Promise<AssistantMessage>;

  resetDemoData(): Promise<void>;
}

const STORAGE_KEYS = {
  EVENTS: "gatherwise_events",
  BUDGET: "gatherwise_budget",
  TASKS: "gatherwise_tasks",
  VENDORS: "gatherwise_vendors",
  IDEAS: "gatherwise_ideas",
  MESSAGES: "gatherwise_messages",
  INITIALIZED: "gatherwise_demo_v1_initialized",
};

export class LocalStorageEventStore implements EventStore {
  isDemoMode(): boolean {
    return true;
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private initDefaultsIfNeeded(): void {
    if (!this.isBrowser()) return;
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
        localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(DEMO_BUDGET_ITEMS));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_TASKS));
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(DEMO_VENDORS));
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEMO_ASSISTANT_MESSAGES));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
      }
    } catch (e) {
      console.warn("Could not initialize localStorage for Gatherwise:", e);
    }
  }

  async resetDemoData(): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(DEMO_BUDGET_ITEMS));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_TASKS));
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(DEMO_VENDORS));
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEMO_ASSISTANT_MESSAGES));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
    } catch (e) {
      console.error("Failed to reset demo data:", e);
    }
  }

  async getEvents(): Promise<EventItem[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_EVENTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : DEMO_EVENTS;
    } catch {
      return DEMO_EVENTS;
    }
  }

  async getEvent(id: string): Promise<EventItem | null> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id) || null;
  }

  async saveEvent(event: EventItem): Promise<EventItem> {
    const events = await this.getEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    const updated = { ...event, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      events[idx] = updated;
    } else {
      events.unshift(updated);
    }
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filtered));
    }
  }

  async getBudgetItems(eventId: string): Promise<BudgetItem[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_BUDGET_ITEMS[eventId] || [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const dict: Record<string, BudgetItem[]> = data ? JSON.parse(data) : DEMO_BUDGET_ITEMS;
      return dict[eventId] || [];
    } catch {
      return DEMO_BUDGET_ITEMS[eventId] || [];
    }
  }

  async saveBudgetItem(item: BudgetItem): Promise<BudgetItem> {
    if (!this.isBrowser()) return item;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const dict: Record<string, BudgetItem[]> = data ? JSON.parse(data) : { ...DEMO_BUDGET_ITEMS };
      const list = dict[item.eventId] || [];
      const idx = list.findIndex((b) => b.id === item.id);
      const updated = { ...item, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.push(updated);
      }
      dict[item.eventId] = list;
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(dict));
      return updated;
    } catch {
      return item;
    }
  }

  async deleteBudgetItem(id: string): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const dict: Record<string, BudgetItem[]> = data ? JSON.parse(data) : {};
      for (const eventId in dict) {
        dict[eventId] = dict[eventId].filter((b) => b.id !== id);
      }
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  }

  async getTasks(eventId: string): Promise<TaskItem[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_TASKS[eventId] || [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const dict: Record<string, TaskItem[]> = data ? JSON.parse(data) : DEMO_TASKS;
      return dict[eventId] || [];
    } catch {
      return DEMO_TASKS[eventId] || [];
    }
  }

  async saveTask(task: TaskItem): Promise<TaskItem> {
    if (!this.isBrowser()) return task;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const dict: Record<string, TaskItem[]> = data ? JSON.parse(data) : { ...DEMO_TASKS };
      const list = dict[task.eventId] || [];
      const idx = list.findIndex((t) => t.id === task.id);
      const updated = { ...task, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.push(updated);
      }
      dict[task.eventId] = list;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(dict));
      return updated;
    } catch {
      return task;
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const dict: Record<string, TaskItem[]> = data ? JSON.parse(data) : {};
      for (const eventId in dict) {
        dict[eventId] = dict[eventId].filter((t) => t.id !== id);
      }
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  }

  async getVendors(eventId: string): Promise<VendorItem[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_VENDORS[eventId] || [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENDORS);
      const dict: Record<string, VendorItem[]> = data ? JSON.parse(data) : DEMO_VENDORS;
      return dict[eventId] || [];
    } catch {
      return DEMO_VENDORS[eventId] || [];
    }
  }

  async saveVendor(vendor: VendorItem): Promise<VendorItem> {
    if (!this.isBrowser()) return vendor;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENDORS);
      const dict: Record<string, VendorItem[]> = data ? JSON.parse(data) : { ...DEMO_VENDORS };
      const list = dict[vendor.eventId] || [];
      const idx = list.findIndex((v) => v.id === vendor.id);
      const updated = { ...vendor, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.push(updated);
      }
      dict[vendor.eventId] = list;
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(dict));
      return updated;
    } catch {
      return vendor;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENDORS);
      const dict: Record<string, VendorItem[]> = data ? JSON.parse(data) : {};
      for (const eventId in dict) {
        dict[eventId] = dict[eventId].filter((v) => v.id !== id);
      }
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  }

  async getIdeas(eventId: string): Promise<IdeaItem[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_IDEAS[eventId] || [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      const dict: Record<string, IdeaItem[]> = data ? JSON.parse(data) : DEMO_IDEAS;
      return dict[eventId] || [];
    } catch {
      return DEMO_IDEAS[eventId] || [];
    }
  }

  async saveIdea(idea: IdeaItem): Promise<IdeaItem> {
    if (!this.isBrowser()) return idea;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      const dict: Record<string, IdeaItem[]> = data ? JSON.parse(data) : { ...DEMO_IDEAS };
      const list = dict[idea.eventId] || [];
      const idx = list.findIndex((i) => i.id === idea.id);
      if (idx >= 0) {
        list[idx] = idea;
      } else {
        list.push(idea);
      }
      dict[idea.eventId] = list;
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(dict));
      return idea;
    } catch {
      return idea;
    }
  }

  async deleteIdea(id: string): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      const dict: Record<string, IdeaItem[]> = data ? JSON.parse(data) : {};
      for (const eventId in dict) {
        dict[eventId] = dict[eventId].filter((i) => i.id !== id);
      }
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  }

  async getMessages(eventId: string): Promise<AssistantMessage[]> {
    this.initDefaultsIfNeeded();
    if (!this.isBrowser()) return DEMO_ASSISTANT_MESSAGES[eventId] || [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const dict: Record<string, AssistantMessage[]> = data ? JSON.parse(data) : DEMO_ASSISTANT_MESSAGES;
      return dict[eventId] || [];
    } catch {
      return DEMO_ASSISTANT_MESSAGES[eventId] || [];
    }
  }

  async saveMessage(msg: AssistantMessage): Promise<AssistantMessage> {
    if (!this.isBrowser()) return msg;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const dict: Record<string, AssistantMessage[]> = data ? JSON.parse(data) : { ...DEMO_ASSISTANT_MESSAGES };
      const list = dict[msg.eventId] || [];
      list.push(msg);
      dict[msg.eventId] = list;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(dict));
      return msg;
    } catch {
      return msg;
    }
  }
}

// Global default storage instance
export const defaultStore: EventStore = new LocalStorageEventStore();
