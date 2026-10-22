"use client";

import React, { useState, useMemo } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { BudgetItem, BudgetPaymentStatus } from "@/types/event";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { BudgetItemModal } from "./budget-item-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PaymentStatusBadge } from "@/components/ui/badge";
import {
  Plus,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Receipt,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";

export function BudgetTab() {
  const {
    activeEvent,
    budgetItems,
    vendors,
    budgetSummary,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    setActiveTab,
  } = useEventStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const currency = activeEvent?.currency || "USD";

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { planned: number; actual: number; count: number }> = {};
    BUDGET_CATEGORIES.forEach((cat) => {
      map[cat] = { planned: 0, actual: 0, count: 0 };
    });

    budgetItems.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = { planned: 0, actual: 0, count: 0 };
      }
      map[item.category].planned += item.plannedAmount || 0;
      map[item.category].actual += item.actualAmount || 0;
      map[item.category].count += 1;
    });

    return Object.entries(map).filter(([_, data]) => data.count > 0 || data.planned > 0);
  }, [budgetItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return budgetItems.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (selectedStatus !== "all" && item.paymentStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [budgetItems, selectedCategory, selectedStatus, searchQuery]);

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingItem) {
      await updateBudgetItem(data);
    } else {
      await addBudgetItem(data);
    }
  };

  const handleQuickStatusChange = async (item: BudgetItem, nextStatus: BudgetPaymentStatus) => {
    await updateBudgetItem({
      ...item,
      paymentStatus: nextStatus,
      // If marking paid in full and actual is 0, default to planned amount
      actualAmount:
        nextStatus === "paid_in_full" && item.actualAmount === 0 ? item.plannedAmount : item.actualAmount,
      updatedAt: new Date().toISOString(),
    });
  };

  const itemToDelete = budgetItems.find((b) => b.id === deletingId);

  return (
    <div className="space-y-6">
      {/* Top Banner Warning if planned exceeds budget limit */}
      {budgetSummary.isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 shadow-xs">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-rose-900">
              Planned Spending Exceeds Event Budget Limit
            </h4>
            <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">
              Your planned expenses total{" "}
              <strong>{formatCurrency(budgetSummary.plannedTotal, currency)}</strong>, which is{" "}
              <strong>{formatCurrency(Math.abs(budgetSummary.remaining), currency)}</strong> over your target budget limit of{" "}
              <strong>{formatCurrency(budgetSummary.budgetLimit, currency)}</strong>. Amounts have not been modified. Consider trimming non-essential line items or asking the Planning Assistant for cost-saving suggestions.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("assistant")}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Ask Assistant
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Limit */}
        <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Target Budget
            </span>
            <div className="p-2 bg-stone-100 text-stone-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(budgetSummary.budgetLimit, currency)}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {activeEvent?.name} target cap
          </div>
        </div>

        {/* Planned Total */}
        <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Planned
            </span>
            <div className="p-2 bg-[#FDF2EC] text-[#B84E33] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(budgetSummary.plannedTotal, currency)}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            Across {budgetSummary.itemCount} allocated items
          </div>
        </div>

        {/* Actual Paid Out */}
        <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Actual Paid Out
            </span>
            <div className="p-2 bg-[#EDF5F0] text-[#256345] rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-900 tracking-tight">
            {formatCurrency(budgetSummary.actualTotal, currency)}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            Deposits & payments settled
          </div>
        </div>

        {/* Remaining Funds */}
        <div className={`p-5 bg-white border rounded-2xl shadow-xs ${
          budgetSummary.isOverBudget ? "border-rose-300 bg-rose-50/20" : "border-stone-200/90"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Remaining Funds
            </span>
            <div className={`p-2 rounded-xl ${
              budgetSummary.isOverBudget ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 text-2xl font-bold tracking-tight ${
            budgetSummary.isOverBudget ? "text-rose-600" : "text-emerald-700"
          }`}>
            {budgetSummary.isOverBudget ? "-" : ""}
            {formatCurrency(Math.abs(budgetSummary.remaining), currency)}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {budgetSummary.isOverBudget ? "Over budget cap" : "Uncommitted safety margin"}
          </div>
        </div>
      </div>

      {/* Category Level Breakdown Cards */}
      <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
            Category Allocations & Progress
          </h3>
          <span className="text-xs text-stone-500">
            {categoryBreakdown.length} active categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryBreakdown.map(([cat, data]) => {
            const pct = budgetSummary.budgetLimit > 0 ? Math.round((data.planned / budgetSummary.budgetLimit) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 bg-stone-50/80 border border-stone-200/70 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-stone-900">
                  <span className="truncate">{cat}</span>
                  <span className="text-stone-500 shrink-0 font-normal">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B84E33] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-2xs text-stone-500">
                  <span>Planned: {formatCurrency(data.planned, currency)}</span>
                  <span>Paid: {formatCurrency(data.actual, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar: Filters, Search, and Add Item Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses & notes..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          >
            <option value="all">All Categories</option>
            {BUDGET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="deposit_paid">Deposit Paid</option>
            <option value="paid_in_full">Paid in Full</option>
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Expense Item
        </button>
      </div>

      {/* Expenses Table / Cards */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-stone-800">
              No budget items found
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                ? "No expenses matched your filter criteria. Try resetting filters."
                : "Add your venue, catering, decor, or entertainment costs to keep track of spending."}
            </p>
            <button
              onClick={handleAddNew}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#B84E33] bg-[#FDF2EC] hover:bg-[#F2D6CB] rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/75 text-2xs font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Planned Cost</th>
                  <th className="py-3 px-4 text-right">Actual Paid</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Linked Vendor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredItems.map((item) => {
                  const linkedVendor = vendors.find((v) => v.id === item.vendorId);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">{item.title}</div>
                        <div className="text-2xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-stone-600">{item.category}</span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-xs">{item.notes}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <PaymentStatusBadge status={item.paymentStatus} />
                          {/* Quick status dropdown on hover */}
                          <select
                            value={item.paymentStatus}
                            onChange={(e) =>
                              handleQuickStatusChange(item, e.target.value as BudgetPaymentStatus)
                            }
                            aria-label={`Change status for ${item.title}`}
                            className="opacity-0 group-hover:opacity-100 text-2xs bg-transparent border-none text-stone-500 hover:text-stone-900 cursor-pointer"
                          >
                            <option value="unpaid">Mark Unpaid</option>
                            <option value="deposit_paid">Mark Deposit Paid</option>
                            <option value="paid_in_full">Mark Paid in Full</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-stone-900 whitespace-nowrap">
                        {formatCurrency(item.plannedAmount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#256345] whitespace-nowrap">
                        {formatCurrency(item.actualAmount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                        {item.dueDate ? formatDate(item.dueDate) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                        {linkedVendor ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#B84E33] font-medium">
                            {linkedVendor.name}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            aria-label={`Edit ${item.title}`}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            aria-label={`Delete ${item.title}`}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <BudgetItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialItem={editingItem}
        vendors={vendors}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await deleteBudgetItem(deletingId);
            setDeletingId(null);
          }
        }}
        title="Delete Budget Item?"
        message={`Are you sure you want to delete "${itemToDelete?.title || "this item"}"? This will update your total planned budget.`}
        confirmLabel="Yes, Delete"
      />
    </div>
  );
}
