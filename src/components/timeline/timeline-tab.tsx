"use client";

import React, { useState, useMemo } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { TaskItem, Priority, TaskStatus } from "@/types/event";
import { formatDate } from "@/lib/utils";
import { TaskModal } from "./task-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PriorityBadge, TaskStatusBadge } from "@/components/ui/badge";
import { fireCelebrationConfetti } from "@/lib/hooks/use-confetti";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  ListFilter,
  Search,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";

export function TimelineTab() {
  const {
    activeEvent,
    tasks,
    taskSummary,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    generateStarterMilestones,
  } = useEventStore();

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;
      if (selectedStatus === "completed" && t.status !== "completed") return false;
      if (selectedStatus === "open" && t.status === "completed") return false;
      if (selectedStatus === "overdue") {
        if (t.status === "completed") return false;
        if (!t.dueDate) return false;
        const [y, m, d] = t.dueDate.split("-").map(Number);
        const due = new Date(y, m - 1, d);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() >= today.getTime()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.assignee && t.assignee.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, selectedPriority, selectedStatus, searchQuery, today]);

  // Group into chronological phases
  const groupedTasks = useMemo(() => {
    const overdue: TaskItem[] = [];
    const thisWeek: TaskItem[] = [];
    const nextMonth: TaskItem[] = [];
    const later: TaskItem[] = [];
    const completed: TaskItem[] = [];

    // Sort by due date
    const sorted = [...filteredTasks].sort((a, b) => {
      return (a.dueDate || "").localeCompare(b.dueDate || "");
    });

    sorted.forEach((t) => {
      if (t.status === "completed") {
        completed.push(t);
        return;
      }
      if (!t.dueDate) {
        later.push(t);
        return;
      }
      const [y, m, d] = t.dueDate.split("-").map(Number);
      const due = new Date(y, m - 1, d);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

      if (diffDays < 0) {
        overdue.push(t);
      } else if (diffDays <= 7) {
        thisWeek.push(t);
      } else if (diffDays <= 30) {
        nextMonth.push(t);
      } else {
        later.push(t);
      }
    });

    return { overdue, thisWeek, nextMonth, later, completed };
  }, [filteredTasks, today]);

  const handleToggleComplete = async (task: TaskItem) => {
    if (task.status !== "completed") {
      fireCelebrationConfetti();
    }
    await toggleTaskStatus(task.id);
  };

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingTask) {
      await updateTask(data);
    } else {
      await addTask(data);
    }
  };

  const taskToDelete = tasks.find((t) => t.id === deletingId);

  return (
    <div className="space-y-6">
      {/* Overview Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Tasks
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 tracking-tight">
            {taskSummary.totalCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            {taskSummary.percentDone}% overall progress
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Completed
          </div>
          <div className="mt-2 text-2xl font-bold text-[#256345] tracking-tight">
            {taskSummary.completedCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            Done & verified
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Due Soon (7 Days)
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {taskSummary.upcomingCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            Immediate attention
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl shadow-xs ${
          taskSummary.overdueCount > 0 ? "border-rose-300 bg-rose-50/20" : "border-stone-200/90"
        }`}>
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Overdue
          </div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${
            taskSummary.overdueCount > 0 ? "text-rose-600" : "text-stone-700"
          }`}>
            {taskSummary.overdueCount}
          </div>
          <div className="mt-1 text-2xs text-stone-500">
            {taskSummary.overdueCount > 0 ? "Needs immediate action" : "All dates on schedule"}
          </div>
        </div>
      </div>

      {/* Action Bar: Filters, Search, View Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, categories, or assignees..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          >
            <option value="all">All Statuses</option>
            <option value="open">To Do & In Progress</option>
            <option value="overdue">Overdue Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Timeline List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-stone-800">
            No milestones planned yet
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Populate your timeline with curated milestones tailored to your {activeEvent?.eventType} or create your own custom tasks.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={generateStarterMilestones}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#256345] hover:bg-[#1e5238] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Starter Milestones
            </button>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Custom Task
            </button>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* Chronological Grouped List View */
        <div className="space-y-6">
          {/* Overdue Section */}
          {groupedTasks.overdue.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Overdue ({groupedTasks.overdue.length})</span>
              </div>
              <div className="space-y-2">
                {groupedTasks.overdue.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={true}
                    onToggle={() => handleToggleComplete(task)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => setDeletingId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week / Urgent */}
          {groupedTasks.thisWeek.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Upcoming This Week ({groupedTasks.thisWeek.length})</span>
              </div>
              <div className="space-y-2">
                {groupedTasks.thisWeek.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={false}
                    onToggle={() => handleToggleComplete(task)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => setDeletingId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Next 30 Days */}
          {groupedTasks.nextMonth.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Next 30 Days ({groupedTasks.nextMonth.length})</span>
              </div>
              <div className="space-y-2">
                {groupedTasks.nextMonth.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={false}
                    onToggle={() => handleToggleComplete(task)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => setDeletingId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Later Milestones */}
          {groupedTasks.later.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Later Milestones ({groupedTasks.later.length})</span>
              </div>
              <div className="space-y-2">
                {groupedTasks.later.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={false}
                    onToggle={() => handleToggleComplete(task)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => setDeletingId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {groupedTasks.completed.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-stone-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-[#256345] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Tasks ({groupedTasks.completed.length})</span>
              </div>
              <div className="space-y-2 opacity-80">
                {groupedTasks.completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={false}
                    onToggle={() => handleToggleComplete(task)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => setDeletingId(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <CalendarView
          tasks={filteredTasks}
          onSelectTask={handleEdit}
          onToggleTask={handleToggleComplete}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialTask={editingTask}
        defaultDueDate={activeEvent?.date}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await deleteTask(deletingId);
            setDeletingId(null);
          }
        }}
        title="Delete Milestone Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title || "this task"}"?`}
        confirmLabel="Yes, Delete"
      />
    </div>
  );
}

function TaskCard({
  task,
  isOverdue,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: TaskItem;
  isOverdue: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`p-4 bg-white border rounded-2xl transition-all shadow-xs flex items-start gap-3.5 group ${
        isCompleted
          ? "border-stone-200/60 bg-stone-50/40 text-stone-500"
          : isOverdue
          ? "border-rose-200 bg-rose-50/30"
          : "border-stone-200/90 hover:border-stone-300"
      }`}
    >
      <button
        onClick={onToggle}
        aria-label={isCompleted ? "Reopen task" : "Mark task complete"}
        className="mt-0.5 text-stone-400 hover:text-[#256345] transition-colors cursor-pointer shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-[#256345] fill-[#EDF5F0]" />
        ) : (
          <Circle className="w-5 h-5 text-stone-400 hover:text-stone-600" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              isCompleted ? "line-through text-stone-400" : "text-stone-900"
            }`}
          >
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
          {task.milestonePhase && (
            <span className="text-2xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-medium">
              {task.milestonePhase}
            </span>
          )}
        </div>

        {task.notes && (
          <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {task.notes}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-2xs text-stone-500 flex-wrap">
          <span className="font-semibold text-stone-700">{task.category}</span>
          <span>•</span>
          <span className={isOverdue ? "text-rose-600 font-semibold" : ""}>
            Due {formatDate(task.dueDate)}
          </span>
          {task.assignee && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                {task.assignee}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onEdit}
          aria-label={`Edit ${task.title}`}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${task.title}`}
          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function CalendarView({
  tasks,
  onSelectTask,
  onToggleTask,
}: {
  tasks: TaskItem[];
  onSelectTask: (t: TaskItem) => void;
  onToggleTask: (t: TaskItem) => void;
}) {
  // Group tasks by Month YYYY-MM
  const monthBuckets = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    tasks.forEach((t) => {
      const monthKey = t.dueDate ? t.dueDate.substring(0, 7) : "Undated";
      if (!map[monthKey]) map[monthKey] = [];
      map[monthKey].push(t);
    });

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {monthBuckets.map(([monthKey, list]) => {
        let title = monthKey;
        if (monthKey !== "Undated") {
          const [y, m] = monthKey.split("-").map(Number);
          const d = new Date(y, m - 1, 1);
          title = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }

        return (
          <div key={monthKey} className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
                {title}
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {list.length} milestone{list.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((task) => {
                const isCompleted = task.status === "completed";
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer hover:shadow-xs ${
                      isCompleted
                        ? "bg-stone-50/50 border-stone-200/60"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-semibold ${isCompleted ? "line-through text-stone-400" : "text-stone-900"}`}>
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-2xs text-stone-500">
                      <span>{task.category}</span>
                      <span className="font-medium text-stone-700">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
