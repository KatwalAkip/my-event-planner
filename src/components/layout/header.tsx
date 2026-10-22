"use client";

import React, { useState } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { EventWizardModal } from "@/components/welcome/event-wizard-modal";
import { Plus, ChevronDown, Check, Sparkles } from "lucide-react";

export function Header() {
  const { events, activeEvent, switchEvent, createEvent, isDemoMode } = useEventStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden bg-white border-b border-stone-200/90 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#B84E33] text-white flex items-center justify-center font-bold text-xs shrink-0">
              G
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-stone-900 truncate max-w-[170px]">
                {activeEvent ? activeEvent.name : "Gatherwise"}
              </div>
              <div className="text-3xs text-stone-500 capitalize flex items-center gap-1">
                <span>{activeEvent?.eventType || "Events"}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-1.5 space-y-0.5">
              <div className="px-3 py-1 text-3xs font-bold text-stone-400 uppercase">
                Your Events
              </div>
              {events.map((e) => {
                const isCurrent = e.id === activeEvent?.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => {
                      switchEvent(e.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                      isCurrent
                        ? "bg-[#FDF2EC] text-[#B84E33] font-semibold"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span className="truncate">{e.name}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#B84E33]" />}
                  </button>
                );
              })}
              <div className="pt-1 border-t border-stone-100 px-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsWizardOpen(true);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-[#B84E33] hover:bg-[#FDF2EC]/70 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Event
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="px-2 py-0.5 bg-emerald-50 text-[#256345] border border-emerald-200 text-3xs font-bold rounded-full">
              Demo Mode
            </span>
          )}
          <button
            onClick={() => setIsWizardOpen(true)}
            aria-label="Create new event"
            className="p-1.5 text-stone-700 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={createEvent}
      />
    </>
  );
}
