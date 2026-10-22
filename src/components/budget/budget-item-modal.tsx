"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { BudgetItem, BudgetPaymentStatus, VendorItem, CurrencyCode } from "@/types/event";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { toMinorUnits, fromMinorUnits } from "@/lib/utils";

interface BudgetItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => Promise<any>;
  initialItem?: BudgetItem | null;
  vendors: VendorItem[];
  currency: CurrencyCode;
}

export function BudgetItemModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  vendors,
  currency,
}: BudgetItemModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [plannedMajor, setPlannedMajor] = useState<number>(0);
  const [actualMajor, setActualMajor] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<BudgetPaymentStatus>("unpaid");
  const [dueDate, setDueDate] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setCategory(initialItem.category);
      setPlannedMajor(fromMinorUnits(initialItem.plannedAmount, currency));
      setActualMajor(fromMinorUnits(initialItem.actualAmount, currency));
      setPaymentStatus(initialItem.paymentStatus);
      setDueDate(initialItem.dueDate || "");
      setVendorId(initialItem.vendorId || "");
      setNotes(initialItem.notes || "");
    } else {
      setTitle("");
      setCategory(BUDGET_CATEGORIES[0]);
      setPlannedMajor(0);
      setActualMajor(0);
      setPaymentStatus("unpaid");
      setDueDate("");
      setVendorId("");
      setNotes("");
    }
  }, [initialItem, isOpen, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...(initialItem || {}),
        title: title.trim(),
        category,
        plannedAmount: toMinorUnits(Number(plannedMajor) || 0, currency),
        actualAmount: toMinorUnits(Number(actualMajor) || 0, currency),
        paymentStatus,
        dueDate: dueDate || undefined,
        vendorId: vendorId || undefined,
        notes: notes.trim() || undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "Edit Budget Item" : "Add Budget Item"}
      description="Track planned estimates and actual expenses with payment statuses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Item Title / Description
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Venue Sunken Garden Rental"
            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as BudgetPaymentStatus)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            >
              <option value="unpaid">Unpaid</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Planned Amount ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={plannedMajor}
              onChange={(e) => setPlannedMajor(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Actual Amount Spent ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={actualMajor}
              onChange={(e) => setActualMajor(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Linked Vendor (Optional)
            </label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            >
              <option value="">None</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Notes & Inclusions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Deposit includes 50% non-refundable hold fee."
            className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
          />
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
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : initialItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
