"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { VendorItem, VendorStatus, CurrencyCode, EventType } from "@/types/event";
import { VENDOR_TYPES_BY_EVENT } from "@/lib/constants";
import { toMinorUnits, fromMinorUnits } from "@/lib/utils";

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: any) => Promise<any>;
  initialVendor?: VendorItem | null;
  currency: CurrencyCode;
  eventType: EventType;
}

export function VendorModal({
  isOpen,
  onClose,
  onSave,
  initialVendor,
  currency,
  eventType,
}: VendorModalProps) {
  const defaultTypes = VENDOR_TYPES_BY_EVENT[eventType] || VENDOR_TYPES_BY_EVENT.wedding;

  const [name, setName] = useState("");
  const [type, setType] = useState(defaultTypes[0] || "Venue");
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<VendorStatus>("to_find");
  const [quotedMajor, setQuotedMajor] = useState<number>(0);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialVendor) {
      setName(initialVendor.name);
      if (defaultTypes.includes(initialVendor.type)) {
        setType(initialVendor.type);
        setIsCustomType(false);
      } else {
        setType("other");
        setCustomType(initialVendor.type);
        setIsCustomType(true);
      }
      setContactPerson(initialVendor.contactPerson || "");
      setEmail(initialVendor.email || "");
      setPhone(initialVendor.phone || "");
      setWebsite(initialVendor.website || "");
      setStatus(initialVendor.status);
      setQuotedMajor(fromMinorUnits(initialVendor.quotedAmount, currency));
      setFollowUpDate(initialVendor.followUpDate || "");
      setNotes(initialVendor.notes || "");
    } else {
      setName("");
      setType(defaultTypes[0] || "Venue");
      setIsCustomType(false);
      setCustomType("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setStatus("to_find");
      setQuotedMajor(0);
      setFollowUpDate("");
      setNotes("");
    }
  }, [initialVendor, isOpen, defaultTypes, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const finalType = isCustomType ? customType.trim() || "Custom Vendor" : type;

      await onSave({
        ...(initialVendor || {}),
        name: name.trim(),
        type: finalType,
        contactPerson: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        status,
        quotedAmount: toMinorUnits(Number(quotedMajor) || 0, currency),
        followUpDate: followUpDate || undefined,
        notes: notes.trim() || undefined,
      });
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
      title={initialVendor ? "Edit Vendor Details" : "Add Vendor to Checklist"}
      description="Track quotes, contacts, and follow-up deadlines for seamless coordination."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Vendor / Business Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heirloom & Thyme Catering"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Vendor Type / Category
            </label>
            {!isCustomType ? (
              <select
                value={type}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomType(true);
                  } else {
                    setType(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
              >
                {defaultTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="custom">+ Add Custom Vendor Type...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Coffee Truck, Calligrapher"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomType(false)}
                  className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Coordination Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VendorStatus)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            >
              <option value="to_find">To Find</option>
              <option value="contacted">Contacted</option>
              <option value="quote_received">Quote Received</option>
              <option value="booked">Booked & Confirmed</option>
              <option value="not_proceeding">Not Proceeding</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Quoted Amount ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={quotedMajor}
              onChange={(e) => setQuotedMajor(Number(e.target.value))}
              placeholder="e.g. 2500"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:border-[#B84E33]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Contact Person
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Chef Margot"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@vendor.com"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (555) 123-4567"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Website / Portfolio URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Next Follow-Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            Coordination Notes & Proposal Details
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Tasting scheduled for next Friday. Includes 5 servers and setup."
            className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
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
            {isSaving ? "Saving..." : initialVendor ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
