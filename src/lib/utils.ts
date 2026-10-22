import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode } from "@/types/event";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  INR: "₹",
  JPY: "¥",
};

/**
 * Format money stored in minor units (e.g. cents) into currency string
 * e.g. 500000 minor units -> $5,000.00
 */
export function formatCurrency(minorUnits: number, currency: CurrencyCode = "USD"): string {
  const isZeroDecimal = currency === "JPY";
  const majorAmount = isZeroDecimal ? minorUnits : minorUnits / 100;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(majorAmount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || "$";
    return `${symbol}${majorAmount.toLocaleString("en-US", {
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    })}`;
  }
}

/**
 * Convert user input (e.g. 150.50) into minor units integer (15050)
 */
export function toMinorUnits(majorAmount: number, currency: CurrencyCode = "USD"): number {
  if (currency === "JPY") {
    return Math.round(majorAmount);
  }
  return Math.round(majorAmount * 100);
}

/**
 * Convert minor units integer (15050) into major amount (150.50)
 */
export function fromMinorUnits(minorUnits: number, currency: CurrencyCode = "USD"): number {
  if (currency === "JPY") {
    return minorUnits;
  }
  return minorUnits / 100;
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a human readable format
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString("en-US", options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get days remaining until event date
 */
export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const target = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Format days until countdown text
 */
export function formatCountdown(dateStr: string): { label: string; isPast: boolean; days: number } {
  const days = getDaysUntil(dateStr);
  if (days === 0) {
    return { label: "Today is the big day!", isPast: false, days: 0 };
  } else if (days === 1) {
    return { label: "Tomorrow", isPast: false, days: 1 };
  } else if (days > 1) {
    return { label: `${days} days to go`, isPast: false, days };
  } else {
    return { label: `${Math.abs(days)} days ago`, isPast: true, days };
  }
}

/**
 * Simple unique ID generator
 */
export function generateId(prefix: string = "gw"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}
