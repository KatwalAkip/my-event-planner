"use client";

import React, { useState } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { formatCurrency, formatDate, formatCountdown } from "@/lib/utils";
import { PriorityBadge, TaskStatusBadge } from "@/components/ui/badge";
import { EventSettingsModal } from "@/components/settings/event-settings-modal";
import { TaskModal } from "@/components/timeline/task-modal";
import { BudgetItemModal } from "@/components/budget/budget-item-modal";
import { fireCelebrationConfetti } from "@/lib/hooks/use-confetti";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Settings,
  Plus,
  AlertTriangle,
  Receipt,
  Users2,
  BookmarkCheck,
  ChevronRight,
  Circle,
} from "lucide-react";

export function OverviewTab() {
  const {
    activeEvent,
    budgetSummary,
    taskSummary,
    vendorSummary,
    tasks,
    vendors,
    ideas,
    setActiveTab,
    toggleTaskStatus,
    updateEvent,
    deleteEvent,
    recalculateMilestoneDates,
    addTask,
    addBudgetItem,
    convertIdeaToTaskOrBudget,
    sendAssistantMessage,
  } = useEventStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  if (!activeEvent) return null;

  const currency = activeEvent.currency;
  const countdown = formatCountdown(activeEvent.date);

  // Find next helpful action based on event state
  const nextAction = (() => {
    // 1. Overdue task
    const overdueTask = tasks.find((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      const [y, m, d] = t.dueDate.split("-").map(Number);
      const due = new Date(y, m - 1, d);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due.getTime() < today.getTime();
    });

    if (overdueTask) {
      return {
        type: "overdue_task",
        title: `Overdue Milestone: ${overdueTask.title}`,
        description: `This task was due on ${formatDate(overdueTask.dueDate)}. Resolving it keeps your upcoming timeline on track.`,
        actionLabel: "View Timeline",
        onClick: () => setActiveTab("timeline"),
        badge: "Urgent Attention",
        badgeVariant: "rose",
      };
    }

    // 2. Vendor needing follow-up
    const followUpVendor = vendors.find((v) => v.status === "to_find" || v.status === "contacted");
    if (followUpVendor) {
      return {
        type: "vendor",
        title: `Secure ${followUpVendor.type}: ${followUpVendor.name}`,
        description: `Status is currently "${followUpVendor.status.replace("_", " ")}". Review quotes or follow up to confirm your booking.`,
        actionLabel: "View Vendors",
        onClick: () => setActiveTab("vendors"),
        badge: "Vendor Action",
        badgeVariant: "terracotta",
      };
    }

    // 3. Over-budget warning
    if (budgetSummary.isOverBudget) {
      return {
        type: "budget",
        title: "Planned spending exceeds target budget limit",
        description: `You are currently ${formatCurrency(Math.abs(budgetSummary.remaining), currency)} over your budget cap. Review line items to rebalance.`,
        actionLabel: "Review Budget",
        onClick: () => setActiveTab("budget"),
        badge: "Budget Advisory",
        badgeVariant: "rose",
      };
    }

    // 4. Default: Next upcoming task
    const nextTask = tasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];

    if (nextTask) {
      return {
        type: "task",
        title: `Next Up: ${nextTask.title}`,
        description: `Scheduled for ${formatDate(nextTask.dueDate)} (${nextTask.category}).`,
        actionLabel: "View in Timeline",
        onClick: () => setActiveTab("timeline"),
        badge: "Next Step",
        badgeVariant: "sage",
      };
    }

    return {
      type: "assistant",
      title: "Plan is looking great! Ask Assistant for optimization",
      description: "Ask Gatherwise to review your checklist, timeline flow, or suggest guest-experience touches.",
      actionLabel: "Open Assistant",
      onClick: () => setActiveTab("assistant"),
      badge: "On Track",
      badgeVariant: "sage",
    };
  })();

  // Filter upcoming tasks (next 4)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 4);

  // Filter top vendors needing attention
  const activeVendors = vendors
    .filter((v) => v.status !== "not_proceeding")
    .slice(0, 3);

  // Spotlight ideas (top 3)
  const spotlightIdeas = ideas.filter((i) => i.state !== "dismissed").slice(0, 3);

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      fireCelebrationConfetti();
    }
    await toggleTaskStatus(taskId);
  };

  return (
    <div className="space-y-6">
      {/* Event Overview Hero Banner */}
      <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#FDF2EC] text-[#B84E33] border border-[#F2D6CB] text-2xs font-bold uppercase tracking-wider rounded-full">
              {activeEvent.eventType}
            </span>
            <span className="px-3 py-0.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              {countdown.label}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {activeEvent.name}
          </h2>

          <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {formatDate(activeEvent.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {activeEvent.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              {activeEvent.guestCount} guests
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            Event Settings
          </button>
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B84E33]" />
            Add Expense
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Next Helpful Action Focus Card */}
      <div className="p-5 bg-gradient-to-r from-stone-900 to-stone-850 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-[#D97757] bg-white/10 px-2 py-0.5 rounded-md">
              {nextAction.badge}
            </span>
            <span className="text-2xs text-stone-300">Recommended Next Step</span>
          </div>
          <h3 className="text-base font-semibold text-stone-100 tracking-tight">
            {nextAction.title}
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
            {nextAction.description}
          </p>
        </div>

        <button
          onClick={nextAction.onClick}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          {nextAction.actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Card */}
        <div
          onClick={() => setActiveTab("budget")}
          className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Budget Overview
              </span>
              <div className="p-2 bg-[#FDF2EC] text-[#B84E33] rounded-xl group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900 tracking-tight">
                {formatCurrency(budgetSummary.plannedTotal, currency)}
              </div>
              <div className="mt-0.5 text-xs text-stone-500">
                of {formatCurrency(budgetSummary.budgetLimit, currency)} planned limit
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    budgetSummary.isOverBudget ? "bg-rose-500" : "bg-[#B84E33]"
                  }`}
                  style={{ width: `${Math.min(100, budgetSummary.percentSpent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-2xs text-stone-500">
                <span>{budgetSummary.percentSpent}% allocated</span>
                <span className={budgetSummary.isOverBudget ? "text-rose-600 font-semibold" : ""}>
                  {budgetSummary.isOverBudget ? "Over limit" : `${formatCurrency(budgetSummary.remaining, currency)} left`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium group-hover:text-[#B84E33]">
            <span>Manage detailed expenses</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Milestone Progress Card */}
        <div
          onClick={() => setActiveTab("timeline")}
          className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Planning Tasks
              </span>
              <div className="p-2 bg-[#EDF5F0] text-[#256345] rounded-xl group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900 tracking-tight">
                {taskSummary.completedCount} / {taskSummary.totalCount}
              </div>
              <div className="mt-0.5 text-xs text-stone-500">
                milestones completed
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#256345] rounded-full transition-all duration-300"
                  style={{ width: `${taskSummary.percentDone}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-2xs text-stone-500">
                <span>{taskSummary.percentDone}% finished</span>
                {taskSummary.overdueCount > 0 ? (
                  <span className="text-rose-600 font-semibold">
                    {taskSummary.overdueCount} overdue
                  </span>
                ) : (
                  <span>All on track</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium group-hover:text-[#256345]">
            <span>View timeline & schedule</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Vendor Coordination Card */}
        <div
          onClick={() => setActiveTab("vendors")}
          className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Vendor Checklist
              </span>
              <div className="p-2 bg-stone-100 text-stone-600 rounded-xl group-hover:scale-105 transition-transform">
                <Users2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900 tracking-tight">
                {vendorSummary.bookedCount} / {vendorSummary.totalCount}
              </div>
              <div className="mt-0.5 text-xs text-stone-500">
                vendors booked & confirmed
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-2xs">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold">
                {vendorSummary.quoteReceivedCount} quotes
              </span>
              <span className="px-2 py-0.5 bg-[#FDF2EC] text-[#B84E33] border border-[#F2D6CB] rounded-md font-semibold">
                {vendorSummary.toFindCount} to find
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium group-hover:text-stone-900">
            <span>Coordinate vendors & quotes</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Upcoming Tasks & Vendor Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Timeline Milestones */}
        <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B84E33]" />
              <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
                Upcoming Timeline Milestones
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("timeline")}
              className="text-xs font-medium text-[#B84E33] hover:underline cursor-pointer"
            >
              See all ({tasks.length}) →
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No upcoming tasks. You are all caught up!
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => {
                const isCompleted = task.status === "completed";
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id, isCompleted)}
                        className="text-stone-400 hover:text-[#256345] transition-colors cursor-pointer shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#256345]" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-stone-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-2xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vendors Needing Attention */}
        <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-[#256345]" />
              <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
                Vendor Follow-ups & Coordination
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("vendors")}
              className="text-xs font-medium text-[#256345] hover:underline cursor-pointer"
            >
              See all ({vendors.length}) →
            </button>
          </div>

          {activeVendors.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No vendors added yet. Click &ldquo;Add Vendor&rdquo; to start tracking.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-3 bg-stone-50/70 hover:bg-stone-50 border border-stone-200/70 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900 truncate">
                        {vendor.name}
                      </span>
                      <span className="text-2xs text-stone-500">({vendor.type})</span>
                    </div>
                    <div className="text-2xs text-stone-500 mt-0.5">
                      {vendor.quotedAmount > 0
                        ? `Quote: ${formatCurrency(vendor.quotedAmount, currency)}`
                        : "No quote entered"}
                      {vendor.followUpDate ? ` • Follow-up: ${formatDate(vendor.followUpDate)}` : ""}
                    </div>
                  </div>

                  <span className="text-2xs px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700 capitalize shrink-0">
                    {vendor.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ideas Spotlight */}
      <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B84E33]" />
            <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
              Personalized Ideas for {activeEvent.name}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("ideas")}
            className="text-xs font-medium text-[#B84E33] hover:underline cursor-pointer"
          >
            Explore all ideas ({ideas.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {spotlightIdeas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-xl flex flex-col justify-between hover:bg-stone-50 transition-colors"
            >
              <div>
                <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">
                  {idea.category}
                </span>
                <h4 className="text-xs font-semibold text-stone-900 mt-1">
                  {idea.title}
                </h4>
                <p className="mt-1 text-2xs text-stone-600 line-clamp-2 leading-relaxed">
                  {idea.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-2xs">
                <span className="text-stone-500 font-medium">
                  {idea.estimatedCostRange}
                </span>
                <button
                  onClick={() => convertIdeaToTaskOrBudget(idea, "task")}
                  className="font-semibold text-[#B84E33] hover:underline cursor-pointer"
                >
                  + Add to Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assistant Prompt Banner */}
      <div className="p-5 bg-[#FAF8F5] border border-stone-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-[#B84E33]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">
              Need inspiration or a sanity-check?
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Ask Gatherwise: &ldquo;What should I do this month?&rdquo; or &ldquo;Where could I reduce costs?&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("assistant")}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          Ask Planning Assistant
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Settings Modal */}
      <EventSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        event={activeEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
        onRecalculateDates={recalculateMilestoneDates}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={addTask}
        defaultDueDate={activeEvent.date}
      />

      {/* Budget Modal */}
      <BudgetItemModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={addBudgetItem}
        vendors={vendors}
        currency={currency}
      />
    </div>
  );
}
