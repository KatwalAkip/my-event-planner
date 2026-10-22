"use client";

import React, { useState } from "react";
import { useEventStore, ActiveTab } from "@/lib/hooks/use-event-store";
import { EventWizardModal } from "@/components/welcome/event-wizard-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  LayoutDashboard,
  Wallet,
  CalendarDays,
  Users2,
  Lightbulb,
  Sparkles,
  Plus,
  RotateCcw,
  ChevronDown,
  Check,
  HeartHandshake,
  Cake,
  Users,
} from "lucide-react";

export function Sidebar() {
  const {
    events,
    activeEvent,
    activeTab,
    setActiveTab,
    switchEvent,
    createEvent,
    resetDemoData,
    isDemoMode,
    taskSummary,
    budgetSummary,
    ideas,
  } = useEventStore();

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeVariant?: "neutral" | "rose" | "terracotta" | "sage";
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "budget",
      label: "Budget Planner",
      icon: Wallet,
      badge: budgetSummary.isOverBudget ? "Over" : null,
      badgeVariant: "rose",
    },
    {
      id: "timeline",
      label: "Timeline & Tasks",
      icon: CalendarDays,
      badge: taskSummary.overdueCount > 0 ? `${taskSummary.overdueCount} due` : null,
      badgeVariant: "rose",
    },
    {
      id: "vendors",
      label: "Vendor Checklist",
      icon: Users2,
    },
    {
      id: "ideas",
      label: "Personalized Ideas",
      icon: Lightbulb,
      badge: ideas.filter((i) => i.state === "saved").length || null,
      badgeVariant: "sage",
    },
    {
      id: "assistant",
      label: "Planning Assistant",
      icon: Sparkles,
      badge: "AI",
      badgeVariant: "terracotta",
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "wedding":
        return <HeartHandshake className="w-4 h-4 text-[#B84E33]" />;
      case "birthday":
        return <Cake className="w-4 h-4 text-amber-600" />;
      case "community":
        return <Users className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-white border-r border-stone-200/90 flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
        {/* Brand & Event Switcher */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-[#B84E33] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              G
            </div>
            <div className="leading-none">
              <span className="font-semibold text-base tracking-tight text-stone-900 block">
                Gatherwise
              </span>
              <span className="text-3xs text-stone-400 font-medium">Event Companion</span>
            </div>
          </div>

          {/* Event Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsEventDropdownOpen((prev) => !prev)}
              className="w-full p-2.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-lg bg-white border border-stone-200 shadow-2xs shrink-0">
                  {activeEvent ? getEventIcon(activeEvent.eventType) : <Sparkles className="w-4 h-4 text-stone-500" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-900 truncate">
                    {activeEvent ? activeEvent.name : "Select an Event"}
                  </div>
                  <div className="text-3xs text-stone-500 capitalize">
                    {activeEvent?.eventType || "No event"}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isEventDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-30 py-1.5 space-y-0.5 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-3xs font-bold text-stone-400 uppercase tracking-wider">
                  Your Events
                </div>
                {events.map((e) => {
                  const isCurrent = e.id === activeEvent?.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        switchEvent(e.id);
                        setIsEventDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-[#FDF2EC] text-[#B84E33] font-semibold"
                          : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getEventIcon(e.eventType)}
                        <span className="truncate">{e.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 shrink-0 text-[#B84E33]" />}
                    </button>
                  );
                })}

                <div className="pt-1 border-t border-stone-100 px-1">
                  <button
                    onClick={() => {
                      setIsEventDropdownOpen(false);
                      setIsWizardOpen(true);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-medium text-[#B84E33] hover:bg-[#FDF2EC]/70 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Event
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FDF2EC] text-[#B84E33] shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#B84E33]" : "text-stone-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-3xs font-bold rounded-full ${
                        item.badgeVariant === "rose"
                          ? "bg-rose-100 text-rose-700"
                          : item.badgeVariant === "terracotta"
                          ? "bg-[#B84E33] text-white"
                          : "bg-emerald-100 text-[#256345]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Demo Bar */}
        <div className="p-4 border-t border-stone-200/80 space-y-3 bg-stone-50/50">
          {isDemoMode && (
            <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold text-stone-500 uppercase tracking-wider">
                  Demo Mode Active
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-3xs text-stone-500 leading-relaxed">
                Persistent local storage. Your edits stay saved in this browser.
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-3xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Demo Data
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Event Wizard Modal */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={createEvent}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data?"
        message="This will restore all demo events, budget items, milestones, and vendor checklists back to their initial seeded states."
        confirmLabel="Reset Everything"
      />
    </>
  );
}
