/** Ask AI conversation: empty state, message thread (markdown / structured steps) and the thinking/loading indicator. */
import { motion } from "framer-motion";
import { Sparkles, Bot, Search, Brain, CheckCircle2, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents, parseStructuredSteps } from "../../utils/aiUtils";
import AIAssistantThinkingStep from "./AIAssistantThinkingStep";

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
                    transition={{ duration: 0.6, ease: "easeOut" }}
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
                            className="absolute inset-x-0 inset-y-0 bg-violet-500/20 blur-[30px] rounded-full"
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
                            className="relative w-24 h-24 rounded-full bg-ios-gray border-2 border-white/5 flex items-center justify-center shadow-2xl z-10"
                        >
                            <Bot size={44} className="text-violet-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />

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
                        <div
                            // ChatPage gives every Ask-AI message a client id; idx is only a fallback
                            key={msg.id ?? `ai-msg-${idx}`}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            {msg.role === "ai" && (
                                <div className="flex items-center gap-2 mb-2 ml-1">
                                    <Bot size={13} className="text-violet-400" />
                                    <span className="text-[10px] uppercase tracking-[0.15em] text-violet-300/80 font-bold font-mono">
                                        CLI-Q_AGENT
                                    </span>
                                </div>
                            )}

                            <div
                                className={`p-4 rounded-2xl text-[13.5px] leading-relaxed ${
                                    msg.role === "user"
                                        ? "bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-900/20"
                                        : "bg-white/5 border border-white/10 text-neutral-300 rounded-tl-sm backdrop-blur-xl"
                                } max-w-[92%]`}
                            >
                                {msg.role === "user" ? (
                                    msg.text
                                ) : parsedSteps ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
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
                                                    className="flex gap-3 bg-white/[0.03] border border-white/[0.04] p-3 rounded-xl hover:bg-white/[0.05] transition-colors"
                                                >
                                                    <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-200 text-[11px] font-bold flex items-center justify-center border border-violet-500/10 shrink-0">
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
                        </div>
                    );
                })}

            {mode === "ask" && isLoading && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Thinking Process Visualizer - Only show during analysis/thinking phases */}
                    {["analysing", "thinking"].includes(thinkingStep) && (
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                            <h5 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-3 px-1">
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
                        <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                            <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
