import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, History, Bookmark, Zap, ChevronDown } from "lucide-react";

/**
 * Title block of the smart-connections page with the Dashboard / History / Saved panel buttons
 * (a dropdown on mobile, a button row on desktop).
 * @param {{ updateActivePanel: (panel: "dashboard" | "history" | "saved") => void }} props
 */
export default function ConnectionsHeader({ updateActivePanel }) {
    const [matcherMenuOpen, setMatcherMenuOpen] = useState(false);

    return (
        <div className="w-full max-w-full md:max-w-2xl flex flex-col items-start justify-start mb-4 md:mb-3 relative z-[120] px-4 md:px-0">
            <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="fill-brand/20 text-brand" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                        Discovery Module
                    </span>
                </div>

                {/* Mobile-Only Dropdown Trigger: Integrated with Branding Tag */}
                <div className="md:hidden relative">
                    <button
                        type="button"
                        aria-label="Switch matcher view"
                        aria-expanded={matcherMenuOpen}
                        onClick={() => setMatcherMenuOpen(!matcherMenuOpen)}
                        className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center gap-0.5"
                    >
                        <ChevronDown
                            size={14}
                            strokeWidth={3}
                            className={`transition-transform duration-300 ${matcherMenuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    <AnimatePresence>
                        {matcherMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-[#0a0a0c] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 p-1.5 z-[150] backdrop-blur-3xl"
                            >
                                <button
                                    onClick={() => {
                                        updateActivePanel("dashboard");
                                        setMatcherMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                >
                                    <BarChart3 size={15} className="text-indigo-400" /> DASHBOARD
                                </button>
                                <button
                                    onClick={() => {
                                        updateActivePanel("history");
                                        setMatcherMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                >
                                    <History size={15} className="text-indigo-400" /> HISTORY
                                </button>
                                <button
                                    onClick={() => {
                                        updateActivePanel("saved");
                                        setMatcherMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                >
                                    <Bookmark size={15} className="text-indigo-400" /> SAVED
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-row items-end justify-between w-full">
                <div className="flex flex-col">
                    <h1 className="text-[26px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                        Intelligence
                    </h1>
                    <span className="text-[20px] md:text-[26px] text-ink-500 font-light uppercase italic leading-none -mt-1 block">
                        Matcher
                    </span>
                </div>

                {/* Desktop Controls Row: Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <button
                            onClick={() => updateActivePanel("dashboard")}
                            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                        >
                            <BarChart3 size={13} /> DASHBOARD
                        </button>
                        <button
                            onClick={() => updateActivePanel("history")}
                            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                        >
                            <History size={13} /> HISTORY
                        </button>
                        <button
                            onClick={() => updateActivePanel("saved")}
                            className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                        >
                            <Bookmark size={13} /> SAVED
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
