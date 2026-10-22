"use client";

import React, { useState } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { EventWizardModal } from "./event-wizard-modal";
import {
  Sparkles,
  HeartHandshake,
  Cake,
  Users,
  Wallet,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface LandingHeroProps {
  onStartDemo: () => void;
}

export function LandingHero({ onStartDemo }: LandingHeroProps) {
  const { switchEvent, createEvent } = useEventStore();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleLaunchEvent = (eventId: string) => {
    switchEvent(eventId);
    onStartDemo();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B84E33] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              G
            </div>
            <span className="font-semibold text-lg tracking-tight text-stone-900">
              Gatherwise
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Create Event
            </button>
            <button
              onClick={onStartDemo}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Try Demo Mode
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF2EC] border border-[#F2D6CB] text-[#B84E33] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GenAI-Powered Planning Companion</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-stone-900 max-w-3xl leading-tight">
          Plan meaningful gatherings with{" "}
          <span className="text-[#B84E33] italic font-normal">less stress</span> and total clarity.
        </h1>

        <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
          Bring your budgets, milestone timelines, vendor coordination, and personalized ideas into one calm, trustworthy workspace. Designed for weddings, milestone birthdays, and community festivals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Explore Pre-Populated Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Fresh Event Setup
          </button>
        </div>

        {/* Seeded Event Quick Access Cards */}
        <div className="w-full pt-10 text-left space-y-3">
          <div className="text-center text-2xs font-bold text-stone-400 uppercase tracking-widest">
            Choose a demo scenario to jump straight into planning:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wedding */}
            <div
              onClick={() => handleLaunchEvent("event_wedding_demo")}
              className="p-5 bg-white border border-stone-200/90 hover:border-[#B84E33]/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-[#FDF2EC] text-[#B84E33]">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <span className="text-2xs font-bold text-stone-500 uppercase">
                  Wedding
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-stone-900 group-hover:text-[#B84E33] transition-colors">
                Maya & Elena&apos;s Botanical Wedding
              </h3>
              <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                115 guests, $28,000 budget, conservatory terrace ceremony with dietary stations and live string trio.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#B84E33]">
                <span>Launch Wedding Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Birthday */}
            <div
              onClick={() => handleLaunchEvent("event_birthday_demo")}
              className="p-5 bg-white border border-stone-200/90 hover:border-amber-400/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Cake className="w-5 h-5" />
                </span>
                <span className="text-2xs font-bold text-stone-500 uppercase">
                  Birthday
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                Leo&apos;s 30th Rooftop & Vinyl Bash
              </h3>
              <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                42 guests, $3,800 budget, Brooklyn loft terrace with taco truck, turntable audio gear, and neon vibes.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Launch Birthday Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Community Event */}
            <div
              onClick={() => handleLaunchEvent("event_community_demo")}
              className="p-5 bg-white border border-stone-200/90 hover:border-[#256345]/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-[#EDF5F0] text-[#256345]">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-2xs font-bold text-stone-500 uppercase">
                  Community Event
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-stone-900 group-hover:text-[#256345] transition-colors">
                Oakridge Harvest Green Community Fair
              </h3>
              <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                260 attendees, $6,500 budget, city permits, volunteer leads, solar stage sound, and pie baking contest.
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#256345]">
                <span>Launch Community Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-stone-200/70 text-left w-full">
          <div className="space-y-2">
            <div className="p-2 w-fit rounded-xl bg-stone-100 text-stone-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900">
              Responsible AI Boundaries
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              No blind overwriting or invented directory spam. All AI suggestions show transparent estimates and require your explicit review.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2 w-fit rounded-xl bg-stone-100 text-stone-700">
              <Wallet className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900">
              Disciplined Budgeting
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Track planned versus actual spending in integer minor units with over-budget alerts that never silently mutate your financial targets.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2 w-fit rounded-xl bg-stone-100 text-stone-700">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900">
              Adaptive Milestones
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Shift event dates with automatic relative recalculation while preserving your custom edits, assignees, and vendor contracts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/50 py-6 text-center text-xs text-stone-400">
        <p>Gatherwise • Built for calm, organized, memorable celebrations.</p>
      </footer>

      {/* Event Wizard Modal */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={async (data) => {
          const created = await createEvent(data);
          onStartDemo();
          return created;
        }}
      />
    </div>
  );
}
