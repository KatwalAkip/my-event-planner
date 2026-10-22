"use client";

import React, { useState } from "react";
import { AssistantStructuredOutput, TaskDraft, BudgetItemDraft, IdeaDraft } from "@/types/event";
import { PriorityBadge } from "@/components/ui/badge";
import { CheckSquare, Square, Plus, CheckCircle2, Sparkles, Calendar, Coins, Lightbulb } from "lucide-react";

interface ActionPreviewCardProps {
  output: AssistantStructuredOutput;
  currency: any;
  onApply: (selected: {
    tasks?: TaskDraft[];
    budgetItems?: BudgetItemDraft[];
    ideas?: IdeaDraft[];
  }) => Promise<void>;
}

export function ActionPreviewCard({ output, currency, onApply }: ActionPreviewCardProps) {
  const [selectedTasks, setSelectedTasks] = useState<number[]>(() =>
    (output.suggestedTasks || []).map((_, i) => i)
  );
  const [selectedBudget, setSelectedBudget] = useState<number[]>(() =>
    (output.suggestedBudgetItems || []).map((_, i) => i)
  );
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>(() =>
    (output.suggestedIdeas || []).map((_, i) => i)
  );

  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const hasAnySuggestions =
    (output.suggestedTasks && output.suggestedTasks.length > 0) ||
    (output.suggestedBudgetItems && output.suggestedBudgetItems.length > 0) ||
    (output.suggestedIdeas && output.suggestedIdeas.length > 0);

  if (!hasAnySuggestions) return null;

  const totalSelected = selectedTasks.length + selectedBudget.length + selectedIdeas.length;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const tasksToApply = (output.suggestedTasks || []).filter((_, i) =>
        selectedTasks.includes(i)
      );
      const budgetToApply = (output.suggestedBudgetItems || []).filter((_, i) =>
        selectedBudget.includes(i)
      );
      const ideasToApply = (output.suggestedIdeas || []).filter((_, i) =>
        selectedIdeas.includes(i)
      );

      await onApply({
        tasks: tasksToApply,
        budgetItems: budgetToApply,
        ideas: ideasToApply,
      });

      setApplied(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const toggleTask = (idx: number) => {
    setSelectedTasks((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleBudget = (idx: number) => {
    setSelectedBudget((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleIdea = (idx: number) => {
    setSelectedIdeas((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="mt-3.5 p-4 bg-stone-50/90 border border-stone-200 rounded-2xl space-y-3.5 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <Sparkles className="w-4 h-4 text-[#B84E33]" />
          <span>Proposed Event Actions (Review & Select)</span>
        </div>
        <span className="text-2xs text-stone-500 font-medium">
          Nothing is added without your review
        </span>
      </div>

      {applied ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Successfully incorporated selected items into your event plan!</span>
        </div>
      ) : (
        <>
          {/* Suggested Tasks */}
          {output.suggestedTasks && output.suggestedTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-2xs font-bold text-stone-700 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Suggested Tasks ({output.suggestedTasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {output.suggestedTasks.map((task, idx) => {
                  const isChecked = selectedTasks.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(idx)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-white border-[#B84E33]/40 shadow-2xs"
                          : "bg-white/60 border-stone-200 text-stone-500"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="Toggle task selection"
                        className="mt-0.5 text-[#B84E33]"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-stone-900">
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        {task.notes && (
                          <p className="mt-0.5 text-2xs text-stone-500">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Budget Items */}
          {output.suggestedBudgetItems && output.suggestedBudgetItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-2xs font-bold text-stone-700 uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-stone-500" />
                <span>Suggested Budget Allocations</span>
              </div>
              <div className="space-y-1.5">
                {output.suggestedBudgetItems.map((item, idx) => {
                  const isChecked = selectedBudget.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleBudget(idx)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-white border-[#B84E33]/40 shadow-2xs"
                          : "bg-white/60 border-stone-200 text-stone-500"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="Toggle budget item selection"
                        className="mt-0.5 text-[#B84E33]"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-stone-900">
                            {item.title}
                          </div>
                          <div className="text-2xs text-stone-500">
                            {item.category} • {item.notes}
                          </div>
                        </div>
                        <div className="font-bold text-stone-900 shrink-0">
                          ~${item.plannedAmount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Ideas */}
          {output.suggestedIdeas && output.suggestedIdeas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-2xs font-bold text-stone-700 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-stone-500" />
                <span>Personalized Idea Concepts</span>
              </div>
              <div className="space-y-1.5">
                {output.suggestedIdeas.map((idea, idx) => {
                  const isChecked = selectedIdeas.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIdea(idx)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-white border-[#B84E33]/40 shadow-2xs"
                          : "bg-white/60 border-stone-200 text-stone-500"
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="Toggle idea selection"
                        className="mt-0.5 text-[#B84E33]"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-900">
                          {idea.title}
                        </div>
                        <p className="mt-0.5 text-2xs text-stone-600">
                          {idea.description}
                        </p>
                        <div className="mt-1 text-2xs text-stone-500">
                          {idea.fitRationale} ({idea.estimatedCostRange})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              disabled={isApplying || totalSelected === 0}
              onClick={handleApply}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isApplying
                ? "Applying..."
                : `Add Selected (${totalSelected}) to Event Plan`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
