/** Ask AI conversation: empty state, message thread (markdown / structured steps) and the thinking/loading indicator. */
import { motion } from "framer-motion";
import { Sparkles, Bot, Search, Brain, CheckCircle2, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents, parseStructuredSteps } from "../../utils/aiUtils";
import AIAssistantThinkingStep from "./AIAssistantThinkingStep";
import { EASE_SOFT } from "../common/motionPresets";

export default function AIAssistantAskThread({
    mode,
    messages,
    isLoading,
    thinkingStep,
    emptyTitle,
    emptyDescription,
}) {
    return (
        <>
            {mode === "ask" && messages.length === 0 && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE_SOFT }}
                    className="h-full flex flex-col items-center justify-center text-center px-4"
                >
                    <div className="relative mb-6">
                        {/* Animated Glow Effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-x-0 inset-y-0 bg-brand/20 blur-[30px] rounded-full"
                        />

                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="relative w-24 h-24 rounded-full bg-ios-gray border-2 border-line-soft flex items-center justify-center shadow-soft-lg z-10"
                        >
                            <Bot size={44} className="text-brand-light drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" />

                            {/* Micro-Sparkles */}
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="absolute -top-2 -right-2 text-violet-300"
                            >
                                <Sparkles size={16} />
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-white mb-3 tracking-tight"
                    >
                        {emptyTitle}
                    </motion.h4>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[14px] text-neutral-400 max-w-[280px] leading-relaxed font-medium"
                    >
                        {emptyDescription}
                    </motion.p>
                </motion.div>
            )}

            {mode === "ask" &&
                messages.map((msg, idx) => {
                    const parsedSteps = msg.role === "ai" ? parseStructuredSteps(msg.text) : null;

                    return (
                        <motion.div
                            // ChatPage gives every Ask-AI message a client id; idx is only a fallback
                            key={msg.id ?? `ai-msg-${idx}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: EASE_SOFT }}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                            {msg.role === "ai" && (
                                <div className="flex items-center gap-2 mb-2 ml-1">
                                    <Bot size={13} className="text-brand-light" />
                                    <span className="text-[10px] uppercase tracking-[0.15em] text-violet-300/80 font-semibold font-mono">
                                        CLI-Q_AGENT
                                    </span>
                                </div>
                            )}

                            <div
                                className={`rounded-[20px] text-[13.5px] leading-relaxed ${
                                    msg.role === "user"
                                        ? "px-4 py-3 bg-brand text-white rounded-tr-md shadow-md shadow-brand/20"
                                        : "p-4 bg-white/[0.04] border border-line text-neutral-300 rounded-tl-md"
                                } max-w-[92%]`}
                            >
                                {msg.role === "user" ? (
                                    msg.text
                                ) : parsedSteps ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand/10 border border-brand/20">
                                            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center border border-brand/30">
                                                <Brain size={16} className="text-violet-300" />
                                            </div>
                                            <span className="text-white font-bold text-[14px]">
                                                {parsedSteps.title}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {parsedSteps.steps.map((step, sIdx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: sIdx * 0.1 }}
                                                    key={sIdx}
                                                    className="flex gap-3 bg-white/[0.03] border border-line-soft p-3 rounded-xl hover:bg-white/[0.05] transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-lg bg-brand/20 text-violet-200 text-[11px] font-bold flex items-center justify-center border border-brand/10 shrink-0">
                                                        {sIdx + 1}
                                                    </span>
                                                    <span className="text-neutral-200 text-[13px] font-medium leading-relaxed">
                                                        {step}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

            {mode === "ask" && isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE_SOFT }}
                    className="space-y-6"
                >
                    {/* Thinking Process Visualizer - Only show during analysis/thinking phases */}
                    {["analysing", "thinking"].includes(thinkingStep) && (
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-line-soft space-y-1">
                            <h5 className="text-[10px] uppercase tracking-[0.2em] text-ink-300 font-bold mb-3 px-1">
                                AI Thinking Process
                            </h5>
                            <AIAssistantThinkingStep
                                icon={Search}
                                label="Analysing past chat"
                                status={
                                    ["thinking", "generating", "refining"].includes(thinkingStep)
                                        ? "completed"
                                        : "active"
                                }
                            />
                            <AIAssistantThinkingStep
                                icon={Brain}
                                label="Thinking"
                                status={
                                    ["generating", "refining"].includes(thinkingStep)
                                        ? "completed"
                                        : thinkingStep === "analysing"
                                          ? "pending"
                                          : "active"
                                }
                            />
                            <AIAssistantThinkingStep
                                icon={Wand2}
                                label="Generating"
                                status={
                                    ["refining"].includes(thinkingStep)
                                        ? "completed"
                                        : ["analysing", "thinking"].includes(thinkingStep)
                                          ? "pending"
                                          : "active"
                                }
                            />
                            <AIAssistantThinkingStep
                                icon={CheckCircle2}
                                label="Refining"
                                status={thinkingStep === "refining" ? "active" : "pending"}
                            />
                        </div>
                    )}

                    {/* Loading Skeleton */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 motion-safe:animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-3/4 rounded-full bg-white/5 motion-safe:animate-pulse" />
                            <div className="h-4 w-full rounded-full bg-white/5 motion-safe:animate-pulse" />
                            <div className="h-4 w-5/6 rounded-full bg-white/5 motion-safe:animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}
