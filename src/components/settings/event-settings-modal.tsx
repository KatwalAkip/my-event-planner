"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EventItem, CurrencyCode } from "@/types/event";
import { CURRENCIES, EVENT_TYPES } from "@/lib/constants";
import { toMinorUnits, fromMinorUnits } from "@/lib/utils";
import { Trash2, AlertCircle } from "lucide-react";

interface EventSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  onUpdate: (updated: EventItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRecalculateDates: (newDate: string) => Promise<void>;
}

export function EventSettingsModal({
  isOpen,
  onClose,
  event,
  onUpdate,
  onDelete,
  onRecalculateDates,
}: EventSettingsModalProps) {
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.date);
  const [location, setLocation] = useState(event.location);
  const [guestCount, setGuestCount] = useState(event.guestCount);
  const [currency, setCurrency] = useState<CurrencyCode>(event.currency);
  const [budgetMajor, setBudgetMajor] = useState(fromMinorUnits(event.budgetLimit, event.currency));
  const [style, setStyle] = useState(event.style);
  const [notes, setNotes] = useState(event.notes || "");
  const [dietaryPreferences, setDietaryPreferences] = useState(event.dietaryPreferences || "");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(event.accessibilityNeeds || "");
  const [recalculateDatesOnSave, setRecalculateDatesOnSave] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(event.name);
    setDate(event.date);
    setLocation(event.location);
    setGuestCount(event.guestCount);
    setCurrency(event.currency);
    setBudgetMajor(fromMinorUnits(event.budgetLimit, event.currency));
    setStyle(event.style);
    setNotes(event.notes || "");
    setDietaryPreferences(event.dietaryPreferences || "");
    setAccessibilityNeeds(event.accessibilityNeeds || "");
  }, [event]);

  const dateChanged = date !== event.date;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: EventItem = {
        ...event,
        name: name.trim(),
        date,
        location: location.trim(),
        guestCount: Number(guestCount) || 1,
        currency,
        budgetLimit: toMinorUnits(Number(budgetMajor) || 0, currency),
        style: style.trim(),
        notes: notes.trim(),
        dietaryPreferences: dietaryPreferences.trim(),
        accessibilityNeeds: accessibilityNeeds.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (dateChanged && recalculateDatesOnSave) {
        await onRecalculateDates(date);
      }

      await onUpdate(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Event Details & Settings"
        description="Update your event's core details, budget limit, and guest requirements."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Event Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          {dateChanged && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Event date changed:</span> Would you like Gatherwise to automatically shift your relative timeline milestones?
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recalc"
                    checked={recalculateDatesOnSave}
                    onChange={(e) => setRecalculateDatesOnSave(e.target.checked)}
                    className="rounded text-[#B84E33] focus:ring-[#B84E33]"
                  />
                  <label htmlFor="recalc" className="font-medium cursor-pointer">
                    Yes, recalculate milestone task dates while keeping my edits
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Guest Count
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
                Budget Limit
              </label>
              <input
                type="number"
                min={0}
                step={50}
                required
                value={budgetMajor}
                onChange={(e) => setBudgetMajor(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Style & Atmosphere
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Dietary Preferences
              </label>
              <input
                type="text"
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                placeholder="e.g. 15 vegan, gluten-free station"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Accessibility Needs
              </label>
              <input
                type="text"
                value={accessibilityNeeds}
                onChange={(e) => setAccessibilityNeeds(e.target.value)}
                placeholder="e.g. Wheelchair ramp, quiet area"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              General Notes & Vision
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Event
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await onDelete(event.id);
          onClose();
        }}
        title="Delete this Event?"
        message={`Are you sure you want to delete "${event.name}"? All associated budget items, tasks, and vendor checklists will be removed.`}
        confirmLabel="Yes, Delete Event"
      />
    </>
  );
}
