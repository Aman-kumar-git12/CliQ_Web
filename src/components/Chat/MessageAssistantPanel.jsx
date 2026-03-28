import { Bot, Brain, Check, CheckCircle2, ChevronLeft, History, Loader2, RefreshCw, Search, Sparkles, Wand2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/**
 * Single step of the AI reasoning process
 */
const ThinkingStep = ({ icon: Icon, label, status = 'pending' }) => {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <div className={`flex items-center gap-2.5 py-1.5 px-3 rounded-xl transition-all duration-500 ${isActive ? 'bg-indigo-500/10 border border-indigo-500/20' : ''}`}>
            {isCompleted ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : isActive ? (
                <Loader2 size={14} className="text-indigo-400 animate-spin" />
            ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
            )}
            <Icon size={14} className={isActive ? 'text-indigo-300' : isCompleted ? 'text-neutral-400' : 'text-neutral-600'} />
            <span className={`text-[12px] font-medium tracking-tight ${isActive ? 'text-indigo-100' : isCompleted ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {label}
            </span>
        </div>
    );
};

/**
 * Responsive grid item for reply suggestions
 */
const SuggestionChips = ({ title, items = [], onUseText, onSendText, accent = "blue" }) => {
    if (!items.length) return null;

    const colorClass = accent === "pink"
        ? "border-pink-500/20 bg-[linear-gradient(180deg,rgba(78,32,57,0.42),rgba(20,20,24,0.92))] text-pink-100 shadow-[0_8px_30px_rgba(236,72,153,0.06)]"
        : "border-[#1a4f9c] bg-[linear-gradient(180deg,rgba(28,40,63,0.92),rgba(16,18,24,0.98))] text-blue-100 shadow-[0_8px_30px_rgba(0,122,255,0.06)]";

    return (
        <div className="space-y-3">
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-500 ml-1">{title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, index) => (
                    <div
                        key={`${title}-${index}`}
                        className={`group flex min-h-[150px] flex-col justify-between rounded-[26px] border px-5 py-5 text-left transition-all duration-300 hover:scale-[1.01] ${colorClass}`}
                    >
                        <p className="text-[15px] leading-relaxed font-medium text-neutral-100">{item}</p>
                        <div className="mt-6 flex items-center gap-3 opacity-95 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onUseText(item)}
                                className="flex-1 rounded-full bg-white/10 px-4 py-3 text-[12px] font-bold text-white transition hover:bg-white/20"
                            >
                                Insert
                            </button>
                            <button
                                onClick={() => onSendText(item)}
                                className="flex-1 rounded-full bg-emerald-500/20 px-4 py-3 text-[12px] font-bold text-emerald-100 transition hover:bg-emerald-500/30"
                            >
                                Send Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const tones = ["casual", "polite", "formal", "flirty", "professional", "witty", "direct", "friendly", "empathetic", "confident"];

const LoadingSkeleton = () => (
    <div className="mt-4 space-y-4 animate-pulse px-2">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
            <div className="h-4 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-5/6 rounded bg-white/5" />
        </div>
    </div>
);

export default function MessageAssistantPanel({
    loading,
    error,
    data,
    draft,
    onGenerate,
    onUseText,
    onSendText,
    selectedTone,
    onToneChange,
    onClose,
    onBack,
    history = [],
    thinkingStep = 'analysing',
}) {
    const historyRef = useRef(null);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (isConfirming) {
            const timer = setTimeout(() => setIsConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isConfirming]);

    const handleRegenerate = () => {
        if (isConfirming) {
            onGenerate();
            setIsConfirming(false);
        } else {
            setIsConfirming(true);
        }
    };

    const scrollToHistory = () => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const rewrites = data?.rewrites
        ? [data.rewrites.clean, data.rewrites.short, data.rewrites.warm, data.rewrites.confident].filter(Boolean)
        : [];

    const hasResults = !!data && !loading;

    return (
        <div className="mx-3 mb-3 flex min-h-0 flex-col rounded-[28px] border border-white/10 bg-[#121214]/98 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-3xl overflow-hidden transition-all duration-500 max-h-[75vh]">
            {/* Nav Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/5 bg-[#1a1b1f]/50 px-5 py-4">
                <div className="flex items-center gap-3">
                    {hasResults && (
                        <div className="flex items-center gap-1.5 mr-1">
                            <button
                                onClick={onBack}
                                className="rounded-full p-2 text-neutral-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                                title="Go Back"
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5">
                        <div className={`rounded-xl p-1.5 ${hasResults ? 'bg-indigo-600/20 text-indigo-400' : 'bg-blue-600/20 text-[#007aff]'}`}>
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white leading-none">
                                {hasResults ? "AI Recommendation" : "Message AI Assistant"}
                            </h3>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1 font-bold">
                                {hasResults ? "Context-Aware Replies" : "Conversational Intel"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasResults && (
                        <button
                            onClick={handleRegenerate}
                            className={`group flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold transition-all active:scale-95 ${
                                isConfirming 
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                    : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-transparent"
                            }`}
                        >
                            {isConfirming ? (
                                <>
                                    <Check size={16} strokeWidth={2.5} className="animate-in fade-in zoom-in duration-300" />
                                    <span>Confirm?</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
                                    <span>Generate New</span>
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="group rounded-full bg-white/5 p-2 text-neutral-400 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 custom-scrollbar space-y-6">
                
                {/* Error Banner */}
                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Reasoning Process Visualizer - Only show during analysis/thinking phases */}
                        {['analysing', 'thinking'].includes(thinkingStep) && (
                            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain size={14} className="text-indigo-400" />
                                    <h5 className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-black">Reasoning Process</h5>
                                </div>
                                <ThinkingStep icon={Search} label="Analyzing conversation data" status={['thinking', 'generating', 'refining'].includes(thinkingStep) ? 'completed' : 'active'} />
                                <ThinkingStep icon={Brain} label="Thinking of responses" status={['generating', 'refining'].includes(thinkingStep) ? 'completed' : thinkingStep === 'analysing' ? 'pending' : 'active'} />
                                <ThinkingStep icon={Wand2} label="Drafting suggestions" status={['refining'].includes(thinkingStep) ? 'completed' : ['analysing', 'thinking'].includes(thinkingStep) ? 'pending' : 'active'} />
                                <ThinkingStep icon={CheckCircle2} label="Finalizing results" status={thinkingStep === 'refining' ? 'active' : 'pending'} />
                            </div>
                        )}
                        <LoadingSkeleton />
                    </div>
                )}

                {/* Input Mode (No results) */}
                {!loading && !data && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-500 ml-1">Select Tone</p>
                            <div className="flex flex-wrap gap-2">
                                {tones.map((tone) => (
                                    <button
                                        key={tone}
                                        onClick={() => onToneChange(tone)}
                                        className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            selectedTone === tone
                                                ? "bg-[#007aff] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)] scale-105"
                                                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={onGenerate}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#007aff] py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition-all hover:scale-[1.01] hover:brightness-110 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                            >
                                <Wand2 size={18} strokeWidth={2.5} />
                                {draft?.trim() ? "Refresh Intent Suggestions" : "Generate Best Replies"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Mode */}
                {hasResults && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
                        
                        {/* 1. Integrated Context Section */}
                        {(data.conversation_summary || data.context_preview || data.last_other_message) && (
                            <div className="rounded-[30px] overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(48,48,51,0.92),rgba(33,33,36,0.95))] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                                <div className="bg-white/5 px-6 py-5 border-b border-white/5">
                                    <p className="text-[10px] items-center flex gap-2 uppercase font-black tracking-widest text-neutral-400">
                                        <Bot size={12} className="text-indigo-400" />
                                        Conversation Context
                                    </p>
                                </div>
                                <div className="p-6 space-y-6">
                                    {data.conversation_summary && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-600">Summary</p>
                                            <p className="text-[15px] leading-relaxed text-neutral-200">{data.conversation_summary}</p>
                                        </div>
                                    )}
                                    {data.last_other_message && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-600">Last Received</p>
                                            <div className="rounded-[24px] border-l-4 border-indigo-500/50 bg-white/5 px-5 py-5 text-[16px] italic text-neutral-100">
                                                "{data.last_other_message}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Top Reply (Hero Section) */}
                        {data.top_reply && (
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-500 ml-1">AI Pick: Top Reply</p>
                                <div className="rounded-[32px] border border-[#1452a7] bg-[linear-gradient(180deg,rgba(31,41,60,0.98),rgba(29,39,58,0.98))] p-8 backdrop-blur-md shadow-[0_18px_50px_rgba(8,20,40,0.35)]">
                                    <div className="flex gap-2 mb-3">
                                        <div className="rounded-full bg-[#2a4b7d] px-4 py-2 text-[10px] font-black uppercase text-blue-100 tracking-tight">Recommended</div>
                                        <div className="rounded-full bg-[#5a3562] px-4 py-2 text-[10px] font-black uppercase text-pink-100 tracking-tight">98% Match</div>
                                    </div>
                                    <p className="text-[20px] leading-relaxed text-white font-medium">
                                        {data.top_reply}
                                    </p>
                                    <div className="mt-8 flex gap-4">
                                        <button 
                                            onClick={() => onUseText(data.top_reply)} 
                                            className="flex-1 rounded-[28px] bg-[#3b4658] h-16 text-[16px] font-bold text-white transition hover:bg-[#465266] active:scale-95"
                                        >
                                            Insert
                                        </button>
                                        <button 
                                            onClick={() => onSendText(data.top_reply)} 
                                            className="flex-1 rounded-[28px] bg-[#244d4f] h-16 text-[16px] font-bold text-emerald-100 transition hover:bg-[#2a5b5d] active:scale-95 overflow-hidden relative group"
                                        >
                                            <span className="relative z-10">Send Now</span>
                                            <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Grid of Suggestions */}
                        <SuggestionChips title="Standard Suggestions" items={data.reply_suggestions} onUseText={onUseText} onSendText={onSendText} />
                        <SuggestionChips title="Emoji Variants" items={data.emoji_replies} onUseText={onUseText} onSendText={onSendText} accent="pink" />
                        <SuggestionChips title="Tone Rewrites" items={rewrites} onUseText={onUseText} onSendText={onSendText} />
                        <SuggestionChips title="Alternative Phrasings" items={data.same_message_variants} onUseText={onUseText} onSendText={onSendText} />

                        {/* History section has been removed and migrated to the AI Overlay */}
                    </div>
                )}
            </div>
        </div>
    );
}
