"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { EVENT_TYPES, CURRENCIES } from "@/lib/constants";
import { EventType, CurrencyCode } from "@/types/event";
import { toMinorUnits, fromMinorUnits } from "@/lib/utils";
import { HeartHandshake, Cake, Users, Utensils, Sparkles } from "lucide-react";

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (eventData: any) => Promise<any>;
}

export function EventWizardModal({ isOpen, onClose, onCreate }: EventWizardModalProps) {
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [name, setName] = useState("Maya & Alex's Wedding Celebration");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });
  const [location, setLocation] = useState("San Francisco, CA");
  const [guestCount, setGuestCount] = useState<number>(100);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [budgetMajor, setBudgetMajor] = useState<number>(20000);
  const [style, setStyle] = useState("Warm Botanical & Candlelight");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: EventType) => {
    setEventType(type);
    const template = EVENT_TYPES.find((t) => t.type === type);
    if (template) {
      setGuestCount(template.defaultGuests);
      setBudgetMajor(fromMinorUnits(template.defaultBudget, currency));
      if (type === "wedding") {
        setName("Our Wedding Celebration");
        setStyle("Warm Botanical & Candlelight");
      } else if (type === "birthday") {
        setName("30th Milestone Birthday Bash");
        setStyle("Retro 70s Grooves, Neon & Street Tacos");
      } else if (type === "community") {
        setName("Neighborhood Harvest Green Festival");
        setStyle("Neighborhood Folk, Zero-Waste & Family Friendly");
      } else if (type === "dinner") {
        setName("Intimate Vineyard Dinner Gathering");
        setStyle("Rustic Candlelit Farm-to-Table");
      } else {
        setName("Special Milestone Gathering");
        setStyle("Modern Warm Elegance");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        eventType,
        date,
        location: location.trim() || "Local Venue",
        guestCount: Number(guestCount) || 1,
        currency,
        budgetLimit: toMinorUnits(Number(budgetMajor) || 0, currency),
        style: style.trim() || "Warm & Celebratory",
        dietaryPreferences: dietaryPreferences.trim(),
        accessibilityNeeds: accessibilityNeeds.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: EventType) => {
    switch (type) {
      case "wedding":
        return <HeartHandshake className="w-5 h-5 text-[#B84E33]" />;
      case "birthday":
        return <Cake className="w-5 h-5 text-amber-600" />;
      case "community":
        return <Users className="w-5 h-5 text-emerald-600" />;
      case "dinner":
        return <Utensils className="w-5 h-5 text-stone-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      description="Tell Gatherwise a few basics. We'll set up your starter budget, milestones, and vendor checklist."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Event Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {EVENT_TYPES.map((t) => {
              const isSelected = eventType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleTypeSelect(t.type)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#B84E33] bg-[#FDF2EC]/70 shadow-xs ring-1 ring-[#B84E33]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="shrink-0">{getIcon(t.type)}</div>
                  <div>
                    <div className="text-sm font-medium text-stone-900">{t.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya & Alex's Wedding"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Event Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        {/* Location & Guest Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Location / City
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Estimated Guest Count
            </label>
            <input
              type="number"
              min={1}
              required
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        {/* Currency & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Target Budget Limit
            </label>
            <input
              type="number"
              min={0}
              step={100}
              required
              value={budgetMajor}
              onChange={(e) => setBudgetMajor(Number(e.target.value))}
              placeholder="e.g. 15000"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        {/* Style & Vibe */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Style & Atmosphere Notes
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g. Earthy Botanical & Warm Candlelight, Retro 70s, Minimalist Modern"
            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
          />
        </div>

        {/* Dietary & Accessibility (optional, collapsible/clear) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Dietary Needs (Optional)
            </label>
            <input
              type="text"
              value={dietaryPreferences}
              onChange={(e) => setDietaryPreferences(e.target.value)}
              placeholder="e.g. Vegan, Celiac gluten-free, Nut allergy"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Accessibility Needs (Optional)
            </label>
            <input
              type="text"
              value={accessibilityNeeds}
              onChange={(e) => setAccessibilityNeeds(e.target.value)}
              placeholder="e.g. Wheelchair ramp, quiet room, ASL"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Event & Generate Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
