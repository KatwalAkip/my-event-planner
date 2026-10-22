"use client";

import React, { useState, useMemo } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { IdeaItem, IdeaCategory } from "@/types/event";
import { IDEA_CATEGORIES } from "@/lib/constants";
import { Modal } from "@/components/ui/modal";
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  CheckCircle2,
  CalendarPlus,
  Coins,
  Plus,
  Search,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

export function IdeasTab() {
  const {
    activeEvent,
    ideas,
    toggleSaveIdea,
    dismissIdea,
    addCustomIdea,
    convertIdeaToTaskOrBudget,
    setActiveTab,
  } = useEventStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Custom Idea Form State
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<IdeaCategory>("themes");
  const [customDesc, setCustomDesc] = useState("");
  const [customRationale, setCustomRationale] = useState("");
  const [customCost, setCustomCost] = useState("");

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // Don't show dismissed unless specifically searched
      if (idea.state === "dismissed" && !searchQuery.trim()) return false;
      if (showSavedOnly && idea.state !== "saved") return false;
      if (selectedCategory !== "all" && idea.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q) ||
          idea.fitRationale.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ideas, selectedCategory, showSavedOnly, searchQuery]);

  const handleActionWithFeedback = async (
    action: () => Promise<void>,
    message: string
  ) => {
    try {
      await action();
      setFeedbackMsg(message);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    await addCustomIdea({
      title: customTitle.trim(),
      category: customCategory,
      description: customDesc.trim(),
      fitRationale: customRationale.trim() || `Tailored for ${activeEvent?.name}`,
      estimatedCostRange: customCost.trim() || "Flexible",
    });

    setCustomTitle("");
    setCustomDesc("");
    setCustomRationale("");
    setCustomCost("");
    setIsAddModalOpen(false);
    setFeedbackMsg("New personalized idea added to your saved list!");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Header Info & Context Note */}
      <div className="p-5 bg-white border border-stone-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#B84E33] uppercase tracking-wider">
              Curated For {activeEvent?.name}
            </span>
            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-2xs rounded-full font-medium">
              {activeEvent?.style}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-600 max-w-2xl leading-relaxed">
            Personalized concepts tailored to your {activeEvent?.guestCount} guests, budget, and{" "}
            {activeEvent?.location}. Click &ldquo;Add to Tasks&rdquo; or &ldquo;Add to Budget&rdquo; to turn any concept into an actionable part of your plan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab("assistant")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#B84E33]" />
            Ask Assistant for Ideas
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Idea
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setShowSavedOnly(false);
              setSelectedCategory("all");
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              !showSavedOnly && selectedCategory === "all"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            All Ideas ({ideas.filter((i) => i.state !== "dismissed").length})
          </button>

          <button
            onClick={() => setShowSavedOnly(true)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              showSavedOnly
                ? "bg-[#B84E33] text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Saved ({ideas.filter((i) => i.state === "saved").length})
          </button>

          {IDEA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setShowSavedOnly(false);
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                !showSavedOnly && selectedCategory === cat.id
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] max-w-xs shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
          />
        </div>
      </div>

      {/* Ideas Cards Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-stone-800">
            No ideas in this view
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {showSavedOnly
              ? "You haven't saved any ideas yet. Bookmark your favorite concepts to find them here."
              : "Try choosing another category or click below to brainstorm with the assistant."}
          </p>
          <button
            onClick={() => setActiveTab("assistant")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Brainstorm with Assistant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => {
            const isSaved = idea.state === "saved";
            return (
              <div
                key={idea.id}
                className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl shadow-xs flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-md">
                      {idea.category.replace("_", " ")}
                    </span>
                    <button
                      onClick={() =>
                        handleActionWithFeedback(
                          () => toggleSaveIdea(idea.id),
                          isSaved ? "Removed from saved" : "Saved to your list!"
                        )
                      }
                      title={isSaved ? "Saved" : "Save idea"}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSaved
                          ? "text-[#B84E33] bg-[#FDF2EC]"
                          : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h4 className="mt-2 text-base font-semibold text-stone-900 tracking-tight leading-snug">
                    {idea.title}
                  </h4>

                  <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                    {idea.description}
                  </p>

                  {/* Why it fits callout */}
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                    <div className="text-2xs font-bold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#B84E33]" />
                      Why it fits your event:
                    </div>
                    <p className="text-2xs text-stone-600 leading-relaxed">
                      {idea.fitRationale}
                    </p>
                  </div>

                  {/* Estimated cost badge */}
                  <div className="mt-3 flex items-center justify-between text-2xs">
                    <span className="text-stone-500">Estimated budget:</span>
                    <span className="font-semibold text-stone-800 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                      {idea.estimatedCostRange} (Est.)
                    </span>
                  </div>
                </div>

                {/* Bottom Card Actions: Add to Tasks, Add to Budget, Dismiss */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleActionWithFeedback(
                          () => convertIdeaToTaskOrBudget(idea, "task"),
                          `Created planning task: "${idea.title}"`
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 text-2xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-stone-500" />
                      Add to Tasks
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleActionWithFeedback(
                          () => convertIdeaToTaskOrBudget(idea, "budget"),
                          `Added "${idea.title}" to budget items`
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1.5 text-2xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-stone-500" />
                      Add to Budget
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissIdea(idea.id)}
                    title="Dismiss idea"
                    className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Idea Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Idea"
        description="Save your own inspiration or concepts to your event plan."
        maxWidth="md"
      >
        <form onSubmit={handleAddCustomIdea} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Idea Title
            </label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Polaroid Guestbook Station"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as IdeaCategory)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
              >
                {IDEA_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Estimated Cost Range
              </label>
              <input
                type="text"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                placeholder="e.g. $100 - $180"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              required
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Describe the setup, vibe, or guest experience..."
              className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Why it fits your event
            </label>
            <input
              type="text"
              value={customRationale}
              onChange={(e) => setCustomRationale(e.target.value)}
              placeholder="e.g. Matches our warm lighting and gives guests immediate keepsakes."
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Idea
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
