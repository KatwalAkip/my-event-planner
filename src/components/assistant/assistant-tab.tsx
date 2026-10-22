"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { ASSISTANT_STARTER_PROMPTS } from "@/lib/constants";
import { ActionPreviewCard } from "./action-preview-card";
import { formatCurrency, formatCountdown } from "@/lib/utils";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Bot,
  User,
  Lightbulb,
  Info,
  RotateCcw,
} from "lucide-react";

export function AssistantTab() {
  const {
    activeEvent,
    messages,
    sendAssistantMessage,
    applySuggestions,
    isSendingAssistantMsg,
    budgetSummary,
    taskSummary,
    vendorSummary,
  } = useEventStore();

  const [inputVal, setInputVal] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currency = activeEvent?.currency || "USD";
  const countdown = activeEvent ? formatCountdown(activeEvent.date) : { label: "" };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSendingAssistantMsg]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isSendingAssistantMsg) return;
    setInputVal("");
    await sendAssistantMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[550px] bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Context Header Bar */}
      <div className="p-4 border-b border-stone-200/80 bg-stone-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FDF2EC] text-[#B84E33]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
                Gatherwise Planning Assistant
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-[#256345] border border-emerald-200 text-2xs font-semibold rounded-full">
                Active Context
              </span>
            </div>
            <p className="text-2xs text-stone-500 mt-0.5">
              Grounded in: <strong>{activeEvent?.name}</strong> • {activeEvent?.guestCount} guests • {countdown.label} • {formatCurrency(budgetSummary.remaining, currency)} remaining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Suggestions require your approval before adding</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2EC] text-[#B84E33] flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-stone-800">
                How can I assist your {activeEvent?.eventType} planning today?
              </h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                I have full context on your guest count ({activeEvent?.guestCount}), budget ({formatCurrency(activeEvent?.budgetLimit || 0, currency)}), style ({activeEvent?.style}), and vendor statuses.
              </p>
            </div>

            {/* Prompt Chips */}
            <div className="w-full pt-2 space-y-2">
              <div className="text-2xs font-bold text-stone-400 uppercase tracking-wider">
                Suggested questions to ask:
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {ASSISTANT_STARTER_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip)}
                    className="text-left text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#B84E33]/40 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    &ldquo;{chip}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chips at top if wanted */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-2xs font-semibold text-stone-400 uppercase whitespace-nowrap">
                Quick Prompts:
              </span>
              {ASSISTANT_STARTER_PROMPTS.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="text-xs text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAssistant
                        ? "bg-[#FDF2EC] text-[#B84E33]"
                        : "bg-stone-900 text-white"
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isAssistant
                          ? "bg-white border border-stone-200/90 text-stone-800"
                          : "bg-stone-900 text-white"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Planning tip if present */}
                      {msg.structuredOutput?.planningTip && (
                        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-2 text-2xs text-amber-900">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            <strong>Planning Tip:</strong> {msg.structuredOutput.planningTip}
                          </span>
                        </div>
                      )}

                      {/* Structured Suggestion Review Card */}
                      {msg.structuredOutput && (
                        <ActionPreviewCard
                          output={msg.structuredOutput}
                          currency={currency}
                          onApply={applySuggestions}
                        />
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-3xs text-stone-400 px-1 ${
                        isAssistant ? "" : "justify-end"
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="hover:text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isSendingAssistantMsg && (
              <div className="flex gap-3 max-w-2xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-[#FDF2EC] text-[#B84E33] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#B84E33] animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-[#B84E33] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#B84E33] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="text-xs text-stone-500 ml-2">
                    Analyzing event context & drafting recommendations...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Composer Area */}
      <div className="p-3.5 border-t border-stone-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2"
        >
          <textarea
            rows={2}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything about ${activeEvent?.name}... (e.g. "What should I focus on this month?", "Ways to trim budget")`}
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#B84E33]/30 focus:bg-white resize-none"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isSendingAssistantMsg}
            className="p-3 text-white bg-[#B84E33] hover:bg-[#A3432B] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message to assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-3xs text-stone-400 px-1">
          <span>Press Enter to send, Shift+Enter for newline</span>
          <span>Never invents unverified vendors or prices</span>
        </div>
      </div>
    </div>
  );
}
