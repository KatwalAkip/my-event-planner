"use client";

import React from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { BudgetTab } from "@/components/budget/budget-tab";
import { TimelineTab } from "@/components/timeline/timeline-tab";
import { VendorsTab } from "@/components/vendors/vendors-tab";
import { IdeasTab } from "@/components/ideas/ideas-tab";
import { AssistantTab } from "@/components/assistant/assistant-tab";

interface AppShellProps {
  onBackToWelcome?: () => void;
}

export function AppShell({ onBackToWelcome }: AppShellProps) {
  const { activeTab, activeEvent, isLoading } = useEventStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "budget":
        return <BudgetTab />;
      case "timeline":
        return <TimelineTab />;
      case "vendors":
        return <VendorsTab />;
      case "ideas":
        return <IdeasTab />;
      case "assistant":
        return <AssistantTab />;
      default:
        return <OverviewTab />;
    }
  };

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: "Event Dashboard",
      subtitle: "High-level progress, upcoming milestones, and immediate focus areas.",
    },
    budget: {
      title: "Budget & Expense Planner",
      subtitle: "Allocations, planned limits, actual payments, and over-budget safeguards.",
    },
    timeline: {
      title: "Milestone Timeline & Tasks",
      subtitle: "Chronological checklists and monthly calendar views for deadline tracking.",
    },
    vendors: {
      title: "Vendor Coordination Checklist",
      subtitle: "Contract statuses, proposals, quotes, and next follow-up dates.",
    },
    ideas: {
      title: "Personalized Event Ideas",
      subtitle: "Curated themes, decor, activities, and weather contingency plans.",
    },
    assistant: {
      title: "Contextual Planning Assistant",
      subtitle: "Ask questions, explore scenarios, and review proposed checklist additions.",
    },
  };

  const currentMeta = tabTitles[activeTab] || tabTitles.overview;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <Header />

        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-stone-200/80 bg-white/50 backdrop-blur-xs">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {currentMeta.subtitle}
            </p>
          </div>

          {onBackToWelcome && (
            <button
              onClick={onBackToWelcome}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Welcome Page
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#B84E33] border-t-transparent animate-spin" />
              <p className="text-xs text-stone-500 font-medium">
                Loading your event data...
              </p>
            </div>
          ) : (
            renderActiveTab()
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
