"use client";

import React from "react";
import { useEventStore, ActiveTab } from "@/lib/hooks/use-event-store";
import {
  LayoutDashboard,
  Wallet,
  CalendarDays,
  Users2,
  Lightbulb,
  Sparkles,
} from "lucide-react";

export function MobileNav() {
  const { activeTab, setActiveTab } = useEventStore();

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "timeline", label: "Timeline", icon: CalendarDays },
    { id: "vendors", label: "Vendors", icon: Users2 },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "assistant", label: "Assistant", icon: Sparkles },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 z-40 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? "text-[#B84E33] font-semibold"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-3xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
