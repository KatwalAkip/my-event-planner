import React from "react";
import { cn } from "@/lib/utils";
import { Priority, BudgetPaymentStatus, VendorStatus, TaskStatus } from "@/types/event";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "terracotta" | "sage" | "amber" | "rose" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "sm", className }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    terracotta: "bg-[#FDF2EC] text-[#B84E33] border-[#F2D6CB]",
    sage: "bg-[#EDF5F0] text-[#256345] border-[#CCE4D5]",
    amber: "bg-[#FFF9EB] text-[#B45309] border-[#FDE68A]",
    rose: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    blue: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  }[variant];

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-medium rounded-full",
    md: "px-3 py-1 text-xs font-semibold rounded-full",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-1 border", variantStyles, sizeStyles, className)}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  switch (priority) {
    case "urgent":
      return <Badge variant="rose">Urgent</Badge>;
    case "high":
      return <Badge variant="terracotta">High</Badge>;
    case "medium":
      return <Badge variant="amber">Medium</Badge>;
    case "low":
    default:
      return <Badge variant="neutral">Low</Badge>;
  }
}

export function TaskStatusBadge({ status, isOverdue }: { status: TaskStatus; isOverdue?: boolean }) {
  if (status === "completed") {
    return <Badge variant="sage">Completed</Badge>;
  }
  if (isOverdue) {
    return <Badge variant="rose">Overdue</Badge>;
  }
  if (status === "in_progress") {
    return <Badge variant="amber">In Progress</Badge>;
  }
  return <Badge variant="neutral">To Do</Badge>;
}

export function PaymentStatusBadge({ status }: { status: BudgetPaymentStatus }) {
  switch (status) {
    case "paid_in_full":
      return <Badge variant="sage">Paid in Full</Badge>;
    case "deposit_paid":
      return <Badge variant="amber">Deposit Paid</Badge>;
    case "unpaid":
    default:
      return <Badge variant="neutral">Unpaid</Badge>;
  }
}

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  switch (status) {
    case "booked":
      return <Badge variant="sage">Booked</Badge>;
    case "quote_received":
      return <Badge variant="blue">Quote Received</Badge>;
    case "contacted":
      return <Badge variant="amber">Contacted</Badge>;
    case "to_find":
      return <Badge variant="terracotta">To Find</Badge>;
    case "not_proceeding":
    default:
      return <Badge variant="neutral">Not Proceeding</Badge>;
  }
}
