"use client";

import React, { useState, useMemo } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { VendorItem, VendorStatus } from "@/types/event";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VendorModal } from "./vendor-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { VendorStatusBadge } from "@/components/ui/badge";
import {
  Plus,
  Users2,
  Phone,
  Mail,
  Globe,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  FileCheck,
} from "lucide-react";

export function VendorsTab() {
  const {
    activeEvent,
    vendors,
    vendorSummary,
    addVendor,
    updateVendor,
    deleteVendor,
    addBudgetItem,
    setActiveTab,
  } = useEventStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const currency = activeEvent?.currency || "USD";
  const eventType = activeEvent?.eventType || "wedding";

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
          (v.notes && v.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [vendors, statusFilter, searchQuery]);

  const handleEdit = (vendor: VendorItem) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingVendor) {
      await updateVendor(data);
    } else {
      await addVendor(data);
    }
  };

  const handleQuickStatusChange = async (vendor: VendorItem, nextStatus: VendorStatus) => {
    await updateVendor({
      ...vendor,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleConvertToBudget = async (vendor: VendorItem) => {
    try {
      await addBudgetItem({
        title: `${vendor.name} (${vendor.type})`,
        category: vendor.type.includes("Venue")
          ? "Venue & Space"
          : vendor.type.includes("Catering")
          ? "Food & Beverage"
          : vendor.type.includes("Photo")
          ? "Photography & Video"
          : "Logistics & Rentals",
        plannedAmount: vendor.quotedAmount || 100000,
        actualAmount: vendor.status === "booked" ? vendor.quotedAmount : 0,
        paymentStatus: vendor.status === "booked" ? "deposit_paid" : "unpaid",
        notes: `Vendor quote from ${vendor.name}. ${vendor.notes || ""}`,
        vendorId: vendor.id,
      });
      setSuccessNote(`Created budget item for "${vendor.name}"!`);
      setTimeout(() => setSuccessNote(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const vendorToDelete = vendors.find((v) => v.id === deletingId);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successNote && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successNote}</span>
          </div>
          <button
            onClick={() => setActiveTab("budget")}
            className="text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
          >
            View in Budget →
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Vendors
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 tracking-tight">
            {vendorSummary.totalCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            Across coordination list
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Booked & Confirmed
          </div>
          <div className="mt-2 text-2xl font-bold text-[#256345] tracking-tight">
            {vendorSummary.bookedCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            {formatCurrency(vendorSummary.totalCommitted, currency)} contracted
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Quotes Received
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 tracking-tight">
            {vendorSummary.quoteReceivedCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            Awaiting decision
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            To Find / Open
          </div>
          <div className="mt-2 text-2xl font-bold text-[#B84E33] tracking-tight">
            {vendorSummary.toFindCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            Categories to research
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors, categories, or contacts..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          >
            <option value="all">All Vendor Statuses</option>
            <option value="to_find">To Find</option>
            <option value="contacted">Contacted</option>
            <option value="quote_received">Quote Received</option>
            <option value="booked">Booked</option>
            <option value="not_proceeding">Not Proceeding</option>
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Users2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-stone-800">
            No vendors found
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No vendors matched your filter. Try adjusting your search query."
              : "Track venues, caterers, photographers, DJs, and equipment rentals in one calm place."}
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#B84E33] bg-[#FDF2EC] hover:bg-[#F2D6CB] rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            let isFollowUpDue = false;
            if (vendor.followUpDate) {
              const [y, m, d] = vendor.followUpDate.split("-").map(Number);
              const due = new Date(y, m - 1, d);
              due.setHours(0, 0, 0, 0);
              isFollowUpDue = due.getTime() <= today.getTime() + 86400000;
            }

            return (
              <div
                key={vendor.id}
                className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl shadow-xs flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">
                        {vendor.type}
                      </span>
                      <h4 className="text-base font-semibold text-stone-900 tracking-tight mt-0.5">
                        {vendor.name}
                      </h4>
                    </div>
                    <VendorStatusBadge status={vendor.status} />
                  </div>

                  {vendor.contactPerson && (
                    <div className="mt-2 text-xs text-stone-600 font-medium">
                      Contact: {vendor.contactPerson}
                    </div>
                  )}

                  {/* Quoted amount display */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xs text-stone-500 font-medium">Quote:</span>
                    <span className="text-sm font-bold text-stone-900">
                      {vendor.quotedAmount > 0
                        ? formatCurrency(vendor.quotedAmount, currency)
                        : "Quote pending"}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    {vendor.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={`mailto:${vendor.email}`}
                          className="hover:text-[#B84E33] truncate"
                        >
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={`tel:${vendor.phone}`}
                          className="hover:text-[#B84E33]"
                        >
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.website && (
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B84E33] hover:underline truncate"
                        >
                          {vendor.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {vendor.notes && (
                    <p className="mt-3 text-xs text-stone-500 line-clamp-2 leading-relaxed bg-stone-50 p-2 rounded-lg border border-stone-100">
                      {vendor.notes}
                    </p>
                  )}

                  {/* Follow-up reminder banner */}
                  {vendor.followUpDate && (
                    <div
                      className={`mt-3 flex items-center gap-1.5 text-2xs p-1.5 rounded-lg font-medium ${
                        isFollowUpDue
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "text-stone-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Follow-up: {formatDate(vendor.followUpDate)}{" "}
                        {isFollowUpDue ? "(Action Due!)" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  {/* Status Dropdown */}
                  <select
                    value={vendor.status}
                    onChange={(e) =>
                      handleQuickStatusChange(vendor, e.target.value as VendorStatus)
                    }
                    className="text-2xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-700 focus:outline-hidden focus:ring-1 focus:ring-[#B84E33]"
                  >
                    <option value="to_find">To Find</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="booked">Booked</option>
                    <option value="not_proceeding">Not Proceeding</option>
                  </select>

                  <div className="flex items-center gap-1">
                    {/* Convert Quote to Budget button */}
                    {vendor.quotedAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleConvertToBudget(vendor)}
                        title="Add quote to Budget Planner"
                        className="p-1.5 text-stone-400 hover:text-[#256345] hover:bg-[#EDF5F0] rounded-lg transition-colors cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(vendor)}
                      aria-label={`Edit ${vendor.name}`}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(vendor.id)}
                      aria-label={`Delete ${vendor.name}`}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialVendor={editingVendor}
        currency={currency}
        eventType={eventType}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await deleteVendor(deletingId);
            setDeletingId(null);
          }
        }}
        title="Remove Vendor?"
        message={`Are you sure you want to delete "${vendorToDelete?.name || "this vendor"}"?`}
        confirmLabel="Yes, Remove"
      />
    </div>
  );
}
