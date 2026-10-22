"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  EventItem,
  BudgetItem,
  TaskItem,
  VendorItem,
  IdeaItem,
  AssistantMessage,
  TaskDraft,
  BudgetItemDraft,
  IdeaDraft,
  Priority,
  TaskStatus,
} from "@/types/event";
import { defaultStore } from "@/lib/services/storage";
import { generateId, toMinorUnits } from "@/lib/utils";
import { STARTER_TASKS_BY_EVENT } from "@/lib/constants";

export type ActiveTab = "overview" | "budget" | "timeline" | "vendors" | "ideas" | "assistant";

interface EventContextType {
  events: EventItem[];
  activeEvent: EventItem | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLoading: boolean;
  isDemoMode: boolean;
  isSendingAssistantMsg: boolean;

  // Data for active event
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  ideas: IdeaItem[];
  messages: AssistantMessage[];

  // Computed Summaries
  budgetSummary: {
    plannedTotal: number;
    actualTotal: number;
    remaining: number;
    budgetLimit: number;
    itemCount: number;
    percentSpent: number;
    isOverBudget: boolean;
  };
  taskSummary: {
    totalCount: number;
    completedCount: number;
    overdueCount: number;
    upcomingCount: number;
    percentDone: number;
  };
  vendorSummary: {
    totalCount: number;
    bookedCount: number;
    toFindCount: number;
    quoteReceivedCount: number;
    totalCommitted: number;
  };

  // Actions
  switchEvent: (id: string) => void;
  createEvent: (data: Partial<EventItem>) => Promise<EventItem>;
  updateEvent: (data: EventItem) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  addBudgetItem: (item: Partial<BudgetItem>) => Promise<BudgetItem>;
  updateBudgetItem: (item: BudgetItem) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;

  addTask: (task: Partial<TaskItem>) => Promise<TaskItem>;
  toggleTaskStatus: (id: string) => Promise<void>;
  updateTask: (task: TaskItem) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  generateStarterMilestones: () => Promise<void>;
  recalculateMilestoneDates: (newEventDate: string) => Promise<void>;

  addVendor: (vendor: Partial<VendorItem>) => Promise<VendorItem>;
  updateVendor: (vendor: VendorItem) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  toggleSaveIdea: (id: string) => Promise<void>;
  dismissIdea: (id: string) => Promise<void>;
  addCustomIdea: (idea: Partial<IdeaItem>) => Promise<IdeaItem>;
  convertIdeaToTaskOrBudget: (idea: IdeaItem, target: "task" | "budget") => Promise<void>;

  sendAssistantMessage: (text: string) => Promise<void>;
  applySuggestions: (params: {
    tasks?: TaskDraft[];
    budgetItems?: BudgetItemDraft[];
    ideas?: IdeaDraft[];
  }) => Promise<void>;

  resetDemoData: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSendingAssistantMsg, setIsSendingAssistantMsg] = useState<boolean>(false);

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  // Load initial events from store
  const loadAllEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await defaultStore.getEvents();
      setEvents(all);
      if (all.length > 0) {
        // preserve existing selection if still exists
        setActiveEventId((prev) => (prev && all.some((e) => e.id === prev) ? prev : all[0].id));
      } else {
        setActiveEventId(null);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  // Load items for active event
  useEffect(() => {
    if (!activeEventId) {
      setBudgetItems([]);
      setTasks([]);
      setVendors([]);
      setIdeas([]);
      setMessages([]);
      return;
    }

    let isMounted = true;
    async function loadEventData() {
      if (!activeEventId) return;
      try {
        const [b, t, v, i, m] = await Promise.all([
          defaultStore.getBudgetItems(activeEventId),
          defaultStore.getTasks(activeEventId),
          defaultStore.getVendors(activeEventId),
          defaultStore.getIdeas(activeEventId),
          defaultStore.getMessages(activeEventId),
        ]);
        if (isMounted) {
          setBudgetItems(b);
          setTasks(t);
          setVendors(v);
          setIdeas(i);
          setMessages(m);
        }
      } catch (err) {
        console.error("Failed to load active event data:", err);
      }
    }

    loadEventData();
    return () => {
      isMounted = false;
    };
  }, [activeEventId]);

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || null;
  }, [events, activeEventId]);

  // Computed Summaries
  const budgetSummary = useMemo(() => {
    const plannedTotal = budgetItems.reduce((acc, item) => acc + (item.plannedAmount || 0), 0);
    const actualTotal = budgetItems.reduce((acc, item) => acc + (item.actualAmount || 0), 0);
    const budgetLimit = activeEvent ? activeEvent.budgetLimit : 0;
    const remaining = budgetLimit - plannedTotal;
    const percentSpent = budgetLimit > 0 ? Math.min(100, Math.round((plannedTotal / budgetLimit) * 100)) : 0;
    const isOverBudget = plannedTotal > budgetLimit;

    return {
      plannedTotal,
      actualTotal,
      remaining,
      budgetLimit,
      itemCount: budgetItems.length,
      percentSpent,
      isOverBudget,
    };
  }, [budgetItems, activeEvent]);

  const taskSummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.status === "completed").length;
    let overdueCount = 0;
    let upcomingCount = 0;

    tasks.forEach((t) => {
      if (t.status !== "completed" && t.dueDate) {
        const [y, m, d] = t.dueDate.split("-").map(Number);
        const due = new Date(y, m - 1, d);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        if (diffDays < 0) {
          overdueCount++;
        } else if (diffDays <= 7) {
          upcomingCount++;
        }
      }
    });

    const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      overdueCount,
      upcomingCount,
      percentDone,
    };
  }, [tasks]);

  const vendorSummary = useMemo(() => {
    const totalCount = vendors.length;
    const bookedCount = vendors.filter((v) => v.status === "booked").length;
    const toFindCount = vendors.filter((v) => v.status === "to_find").length;
    const quoteReceivedCount = vendors.filter((v) => v.status === "quote_received").length;
    const totalCommitted = vendors
      .filter((v) => v.status === "booked")
      .reduce((acc, v) => acc + (v.quotedAmount || 0), 0);

    return {
      totalCount,
      bookedCount,
      toFindCount,
      quoteReceivedCount,
      totalCommitted,
    };
  }, [vendors]);

  // Actions
  const switchEvent = useCallback((id: string) => {
    setActiveEventId(id);
  }, []);

  const createEvent = useCallback(
    async (data: Partial<EventItem>): Promise<EventItem> => {
      const newEvent: EventItem = {
        id: generateId("event"),
        ownerId: "user_demo",
        name: data.name || "New Event",
        eventType: data.eventType || "wedding",
        date: data.date || new Date().toISOString().split("T")[0],
        time: data.time || "14:00",
        timeZone: data.timeZone || "America/New_York",
        location: data.location || "City, State",
        guestCount: data.guestCount || 50,
        currency: data.currency || "USD",
        budgetLimit: data.budgetLimit || 500000,
        style: data.style || "Warm & Celebratory",
        notes: data.notes || "",
        dietaryPreferences: data.dietaryPreferences || "",
        accessibilityNeeds: data.accessibilityNeeds || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await defaultStore.saveEvent(newEvent);
      setEvents((prev) => [saved, ...prev]);
      setActiveEventId(saved.id);

      // Auto populate starter milestones for new events
      const starterTemplates = STARTER_TASKS_BY_EVENT[saved.eventType] || STARTER_TASKS_BY_EVENT.other;
      const starterTasks: TaskItem[] = starterTemplates.map((t) => {
        const d = new Date(saved.date);
        d.setDate(d.getDate() - t.daysBeforeEvent);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return {
          id: generateId("task"),
          eventId: saved.id,
          title: t.title,
          category: t.category,
          dueDate: `${y}-${m}-${day}`,
          priority: t.priority,
          status: "todo" as TaskStatus,
          notes: t.notes,
          source: "template",
          milestonePhase: t.milestonePhase,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      for (const t of starterTasks) {
        await defaultStore.saveTask(t);
      }

      setTasks(starterTasks);
      return saved;
    },
    []
  );

  const updateEvent = useCallback(
    async (updated: EventItem) => {
      await defaultStore.saveEvent(updated);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    },
    []
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      await defaultStore.deleteEvent(id);
      setEvents((prev) => {
        const filtered = prev.filter((e) => e.id !== id);
        if (activeEventId === id) {
          setActiveEventId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
    },
    [activeEventId]
  );

  // Budget Actions
  const addBudgetItem = useCallback(
    async (item: Partial<BudgetItem>): Promise<BudgetItem> => {
      if (!activeEventId) throw new Error("No active event");
      const newItem: BudgetItem = {
        id: generateId("b"),
        eventId: activeEventId,
        title: item.title || "Untitled Expense",
        category: item.category || "General",
        plannedAmount: item.plannedAmount || 0,
        actualAmount: item.actualAmount || 0,
        paymentStatus: item.paymentStatus || "unpaid",
        dueDate: item.dueDate,
        notes: item.notes,
        vendorId: item.vendorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const saved = await defaultStore.saveBudgetItem(newItem);
      setBudgetItems((prev) => [...prev, saved]);
      return saved;
    },
    [activeEventId]
  );

  const updateBudgetItem = useCallback(async (item: BudgetItem) => {
    await defaultStore.saveBudgetItem(item);
    setBudgetItems((prev) => prev.map((b) => (b.id === item.id ? item : b)));
  }, []);

  const deleteBudgetItem = useCallback(async (id: string) => {
    await defaultStore.deleteBudgetItem(id);
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Task Actions
  const addTask = useCallback(
    async (task: Partial<TaskItem>): Promise<TaskItem> => {
      if (!activeEventId) throw new Error("No active event");
      const newTask: TaskItem = {
        id: generateId("task"),
        eventId: activeEventId,
        title: task.title || "New Task",
        category: task.category || "General",
        dueDate: task.dueDate || (activeEvent ? activeEvent.date : new Date().toISOString().split("T")[0]),
        priority: task.priority || "medium",
        status: task.status || "todo",
        notes: task.notes || "",
        assignee: task.assignee || "",
        source: task.source || "manual",
        milestonePhase: task.milestonePhase || "Upcoming",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const saved = await defaultStore.saveTask(newTask);
      setTasks((prev) => [saved, ...prev]);
      return saved;
    },
    [activeEventId, activeEvent]
  );

  const toggleTaskStatus = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const nextStatus: TaskStatus = task.status === "completed" ? "todo" : "completed";
      const updated: TaskItem = {
        ...task,
        status: nextStatus,
        completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      await defaultStore.saveTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks]
  );

  const updateTask = useCallback(async (task: TaskItem) => {
    await defaultStore.saveTask(task);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await defaultStore.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const generateStarterMilestones = useCallback(async () => {
    if (!activeEvent) return;
    const starterTemplates = STARTER_TASKS_BY_EVENT[activeEvent.eventType] || STARTER_TASKS_BY_EVENT.other;
    const newTasks: TaskItem[] = starterTemplates.map((t) => {
      const d = new Date(activeEvent.date);
      d.setDate(d.getDate() - t.daysBeforeEvent);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return {
        id: generateId("task"),
        eventId: activeEvent.id,
        title: t.title,
        category: t.category,
        dueDate: `${y}-${m}-${day}`,
        priority: t.priority,
        status: "todo" as TaskStatus,
        notes: t.notes,
        source: "template",
        milestonePhase: t.milestonePhase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    for (const t of newTasks) {
      await defaultStore.saveTask(t);
    }
    setTasks((prev) => [...newTasks, ...prev]);
  }, [activeEvent]);

  const recalculateMilestoneDates = useCallback(
    async (newEventDate: string) => {
      if (!activeEvent || !newEventDate) return;
      const oldEventDate = new Date(activeEvent.date).getTime();
      const newTime = new Date(newEventDate).getTime();
      const diffMs = newTime - oldEventDate;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return;

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          if (!task.dueDate) return task;
          try {
            const [y, m, d] = task.dueDate.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            date.setDate(date.getDate() + diffDays);
            const newDue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
              date.getDate()
            ).padStart(2, "0")}`;
            const updated = { ...task, dueDate: newDue, updatedAt: new Date().toISOString() };
            await defaultStore.saveTask(updated);
            return updated;
          } catch {
            return task;
          }
        })
      );
      setTasks(updatedTasks);
    },
    [activeEvent, tasks]
  );

  // Vendor Actions
  const addVendor = useCallback(
    async (vendor: Partial<VendorItem>): Promise<VendorItem> => {
      if (!activeEventId) throw new Error("No active event");
      const newVendor: VendorItem = {
        id: generateId("v"),
        eventId: activeEventId,
        type: vendor.type || "General",
        name: vendor.name || "New Vendor",
        contactPerson: vendor.contactPerson || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        website: vendor.website || "",
        status: vendor.status || "to_find",
        quotedAmount: vendor.quotedAmount || 0,
        followUpDate: vendor.followUpDate,
        notes: vendor.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const saved = await defaultStore.saveVendor(newVendor);
      setVendors((prev) => [...prev, saved]);
      return saved;
    },
    [activeEventId]
  );

  const updateVendor = useCallback(async (vendor: VendorItem) => {
    await defaultStore.saveVendor(vendor);
    setVendors((prev) => prev.map((v) => (v.id === vendor.id ? vendor : v)));
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    await defaultStore.deleteVendor(id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Ideas Actions
  const toggleSaveIdea = useCallback(
    async (id: string) => {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return;
      const nextState = idea.state === "saved" ? "browsing" : "saved";
      const updated: IdeaItem = { ...idea, state: nextState };
      await defaultStore.saveIdea(updated);
      setIdeas((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [ideas]
  );

  const dismissIdea = useCallback(
    async (id: string) => {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return;
      const updated: IdeaItem = { ...idea, state: "dismissed" };
      await defaultStore.saveIdea(updated);
      setIdeas((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    [ideas]
  );

  const addCustomIdea = useCallback(
    async (idea: Partial<IdeaItem>): Promise<IdeaItem> => {
      if (!activeEventId) throw new Error("No active event");
      const newIdea: IdeaItem = {
        id: generateId("idea"),
        eventId: activeEventId,
        category: idea.category || "other",
        title: idea.title || "Custom Idea",
        description: idea.description || "",
        fitRationale: idea.fitRationale || "User added idea",
        estimatedCostRange: idea.estimatedCostRange || "Flexible",
        state: "saved",
        source: "user",
        createdAt: new Date().toISOString(),
      };
      const saved = await defaultStore.saveIdea(newIdea);
      setIdeas((prev) => [saved, ...prev]);
      return saved;
    },
    [activeEventId]
  );

  const convertIdeaToTaskOrBudget = useCallback(
    async (idea: IdeaItem, target: "task" | "budget") => {
      if (!activeEventId || !activeEvent) return;
      if (target === "task") {
        await addTask({
          title: `Implement Idea: ${idea.title}`,
          category: idea.category,
          dueDate: activeEvent.date,
          priority: "medium",
          notes: `${idea.description}\nRationale: ${idea.fitRationale}`,
          source: "ai_suggested",
        });
      } else {
        // extract first number or default
        const match = idea.estimatedCostRange.match(/\d+/);
        const amount = match ? parseInt(match[0], 10) : 100;
        await addBudgetItem({
          title: idea.title,
          category: "Decor & Florals",
          plannedAmount: toMinorUnits(amount, activeEvent.currency),
          notes: idea.description,
        });
      }
    },
    [activeEventId, activeEvent, addTask, addBudgetItem]
  );

  // Assistant Actions
  const sendAssistantMessage = useCallback(
    async (text: string) => {
      if (!activeEvent || !text.trim()) return;

      const userMsg: AssistantMessage = {
        id: generateId("msg_u"),
        eventId: activeEvent.id,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      await defaultStore.saveMessage(userMsg);
      setMessages((prev) => [...prev, userMsg]);
      setIsSendingAssistantMsg(true);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            event: {
              id: activeEvent.id,
              name: activeEvent.name,
              eventType: activeEvent.eventType,
              date: activeEvent.date,
              location: activeEvent.location,
              guestCount: activeEvent.guestCount,
              currency: activeEvent.currency,
              budgetLimit: activeEvent.budgetLimit,
              style: activeEvent.style,
              dietaryPreferences: activeEvent.dietaryPreferences,
              accessibilityNeeds: activeEvent.accessibilityNeeds,
            },
            budgetSummary,
            taskSummary,
            vendorSummary,
          }),
        });

        if (!res.ok) {
          throw new Error("Assistant API returned error");
        }

        const data = await res.json();
        const assistantMsg: AssistantMessage = {
          id: generateId("msg_a"),
          eventId: activeEvent.id,
          role: "assistant",
          content: data.output.reply,
          structuredOutput: data.output,
          timestamp: new Date().toISOString(),
        };

        await defaultStore.saveMessage(assistantMsg);
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("Failed to query assistant:", err);
        const fallbackMsg: AssistantMessage = {
          id: generateId("msg_err"),
          eventId: activeEvent.id,
          role: "assistant",
          content: `I am currently working with your offline planning notes for **${activeEvent.name}**. To keep your plans moving smoothly, I recommend checking your upcoming tasks and vendor deadlines.`,
          timestamp: new Date().toISOString(),
        };
        await defaultStore.saveMessage(fallbackMsg);
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsSendingAssistantMsg(false);
      }
    },
    [activeEvent, budgetSummary, taskSummary, vendorSummary]
  );

  const applySuggestions = useCallback(
    async (params: {
      tasks?: TaskDraft[];
      budgetItems?: BudgetItemDraft[];
      ideas?: IdeaDraft[];
    }) => {
      if (!activeEvent) return;

      if (params.tasks && params.tasks.length > 0) {
        for (const t of params.tasks) {
          const d = new Date(activeEvent.date);
          d.setDate(d.getDate() - (t.dueDateOffsetDays || 7));
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");

          await addTask({
            title: t.title,
            category: t.category || "Planning",
            dueDate: `${y}-${m}-${day}`,
            priority: t.priority || "medium",
            notes: t.notes || "Added via Gatherwise Assistant suggestion",
            source: "ai_suggested",
          });
        }
      }

      if (params.budgetItems && params.budgetItems.length > 0) {
        for (const b of params.budgetItems) {
          await addBudgetItem({
            title: b.title,
            category: b.category || "General",
            plannedAmount: toMinorUnits(b.plannedAmount, activeEvent.currency),
            notes: b.notes || "Added via Gatherwise Assistant suggestion",
          });
        }
      }

      if (params.ideas && params.ideas.length > 0) {
        for (const i of params.ideas) {
          const newIdea: IdeaItem = {
            id: generateId("idea"),
            eventId: activeEvent.id,
            category: i.category,
            title: i.title,
            description: i.description,
            fitRationale: i.fitRationale,
            estimatedCostRange: i.estimatedCostRange,
            state: "saved",
            source: "ai",
            createdAt: new Date().toISOString(),
          };
          await defaultStore.saveIdea(newIdea);
          setIdeas((prev) => [newIdea, ...prev]);
        }
      }
    },
    [activeEvent, addTask, addBudgetItem]
  );

  const resetDemoData = useCallback(async () => {
    setIsLoading(true);
    await defaultStore.resetDemoData();
    await loadAllEvents();
    setIsLoading(false);
  }, [loadAllEvents]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeTab,
        setActiveTab,
        isLoading,
        isDemoMode: defaultStore.isDemoMode(),
        isSendingAssistantMsg,

        budgetItems,
        tasks,
        vendors,
        ideas,
        messages,

        budgetSummary,
        taskSummary,
        vendorSummary,

        switchEvent,
        createEvent,
        updateEvent,
        deleteEvent,

        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,

        addTask,
        toggleTaskStatus,
        updateTask,
        deleteTask,
        generateStarterMilestones,
        recalculateMilestoneDates,

        addVendor,
        updateVendor,
        deleteVendor,

        toggleSaveIdea,
        dismissIdea,
        addCustomIdea,
        convertIdeaToTaskOrBudget,

        sendAssistantMessage,
        applySuggestions,

        resetDemoData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventStore() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventStore must be used within an EventProvider");
  }
  return context;
}
