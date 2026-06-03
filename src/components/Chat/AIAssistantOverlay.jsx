import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Bot, Search, Brain, CheckCircle2, Loader2, Info, SendHorizontal, Wand2, History, Trash2, MessageSquarePlus, Smile, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents, parseStructuredSteps } from '../../utils/aiUtils';

const ThinkingStep = ({ icon: Icon, label, status = 'pending' }) => {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <div className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-violet-500/10 border border-violet-500/20' : ''}`}>
            {isCompleted ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : isActive ? (
                <Loader2 size={14} className="text-violet-400 animate-spin" />
            ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
            )}
            <Icon size={14} className={isActive ? 'text-violet-300' : isCompleted ? 'text-neutral-400' : 'text-neutral-600'} />
            <span className={`text-[12px] font-medium tracking-tight ${isActive ? 'text-violet-100' : isCompleted ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {label}
            </span>
        </div>
    );
};

export default function AIAssistantOverlay({ 
    isOpen, 
    onClose, 
    messages = [], 
    isLoading, 
    thinkingStep = 'idle',
    title = "Message AI",
    subtitle = "Chat-aware assistant with messaging guidance",
    emptyTitle = "How can I help with this chat?",
    emptyDescription = "Ask about this conversation, get message ideas, or understand what the other person means.",
    inputValue = "",
    onInputChange,
    onSubmit,
    mode = 'ask',
    onModeChange,
    replyData = null,
    replyLoading = false,
    error = "",
    selectedTone = 'polite',
    onToneChange,
    emojiPreference = 'both',
    onEmojiPreferenceChange,
    onGenerateReplies,
    onUseReply,
    onSendReply,
    history = [],
    askHistory = [],
    onContinueAskHistory,
    onNewAskChat,
    onClearAskHistory,
    onClearReplyHistory,
    onDeleteAskHistoryItem,
    onDeleteReplyHistoryItem,
}) {
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const [showHistoryToggle, setShowHistoryToggle] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [toneDropdownOpen, setToneDropdownOpen] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setShowHistoryToggle(false);
    }, [mode]);

    if (!isOpen) return null;

    const tones = [
        { key: "casual", emoji: "😎" },
        { key: "polite", emoji: "🤝" },
        { key: "formal", emoji: "👔" },
        { key: "flirty", emoji: "😏" },
        { key: "professional", emoji: "💼" },
        { key: "witty", emoji: "🧠" },
        { key: "direct", emoji: "🎯" },
        { key: "friendly", emoji: "😊" },
        { key: "empathetic", emoji: "💛" },
        { key: "confident", emoji: "💪" },
    ];
    const rewrites = replyData?.rewrites
        ? [replyData.rewrites.clean, replyData.rewrites.short, replyData.rewrites.warm, replyData.rewrites.confident].filter(Boolean)
        : [];
    const emojiRepliesWith = replyData?.emoji_replies_with_emojis?.length
        ? replyData.emoji_replies_with_emojis
        : (replyData?.emoji_replies || []);
    const emojiRepliesWithout = replyData?.emoji_replies_without_emojis?.length
        ? replyData.emoji_replies_without_emojis
        : (replyData?.emoji_replies || []);
    const groupedReplies = replyData?.grouped_replies
        ? [
            { label: 'Top Reply', value: replyData.grouped_replies.top_reply },
            { label: 'Safe', value: replyData.grouped_replies.safe_reply || replyData.grouped_replies.opener || replyData.grouped_replies.short_reply },
            { label: 'Warm', value: replyData.grouped_replies.warm_reply },
            { label: 'Playful', value: replyData.grouped_replies.playful_reply || replyData.grouped_replies.follow_up },
            { label: 'Curious', value: replyData.grouped_replies.curious_reply || replyData.grouped_replies.follow_up },
            { label: 'Direct', value: replyData.grouped_replies.direct_reply || replyData.grouped_replies.confident_reply },
        ].filter((item) => item.value)
        : [];
    const replyModeLabel = replyData?.routing_source === 'general_mode' ? 'General guidance' : 'Chat-context mode';
    const replyModelLabel = replyData?.generation_source
        ? String(replyData.generation_source).replaceAll('_', ' ')
        : 'message assistant';
    const aiUnderstandingParagraph = [
        replyData?.conversation_summary,
        replyData?.context_focus,
        replyData?.detected_intent ? `The main intent looks like ${String(replyData.detected_intent).replaceAll('_', ' ')}.` : '',
    ]
        .filter(Boolean)
        .join(' ');

    const renderReplyCard = (text, key, { highlighted = false, label = '' } = {}) => (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`group relative rounded-xl p-3 space-y-2 transition-all duration-300 ${
                highlighted
                    ? 'border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.04] to-transparent shadow-[0_8px_32px_rgba(99,102,241,0.12)]'
                    : 'border border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.10]'
            }`}
        >
            {highlighted && (
                <div className="absolute -top-px left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            )}
            {label && (
                <p className={`text-[9px] uppercase tracking-[0.2em] font-bold ${highlighted ? 'text-violet-300/80' : 'text-neutral-500'}`}>
                    {label}
                </p>
            )}
            <p className={`${highlighted ? 'text-[14px] leading-6 text-white font-medium tracking-[-0.01em]' : 'text-[13px] leading-relaxed text-neutral-200'}`}>
                {text}
            </p>
            <div className="flex gap-1.5 pt-0.5">
                <button
                    onClick={() => onUseReply?.(text)}
                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 active:scale-95 ${
                        highlighted ? 'bg-white/[0.10] hover:bg-white/[0.16] border border-white/[0.06]' : 'bg-white/[0.07] hover:bg-white/[0.12]'
                    }`}
                >
                    Insert
                </button>
                <button
                    onClick={() => onSendReply?.(text)}
                    className="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/10 transition-all duration-200 active:scale-95"
                >
                    Send Now
                </button>
            </div>
        </motion.div>
    );

    const SectionCard = ({ children, className = '' }) => (
        <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 ${className}`}>
            {children}
        </div>
    );

    const SectionLabel = ({ children, icon: LabelIcon, className = '' }) => (
        <div className={`flex items-center gap-2 mb-2 ${className}`}>
            {LabelIcon && (
                <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
                    <LabelIcon size={11} className="text-neutral-400" />
                </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">{children}</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute inset-0 z-[100] flex flex-col bg-[#050507]/90 backdrop-blur-3xl rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
            {/* Confirmation Overlay */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[110] bg-[#050507]/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 w-full max-w-[320px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-5 flex flex-col items-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                <Trash2 size={20} className="text-red-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[13px] font-bold text-white tracking-widest uppercase">
                                    {confirmAction.type.startsWith('clear') ? 'Clear All History' : 'Delete Item'}
                                </h3>
                                <p className="text-[12px] text-neutral-400 leading-relaxed px-2">
                                    Are you sure you want to {confirmAction.type.startsWith('clear') ? 'permanently clear all your' : 'delete this'} {mode === 'ask' ? 'Ask AI' : 'Reply'} history? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full pt-2">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmAction.type === 'clear_ask') onClearAskHistory?.();
                                        else if (confirmAction.type === 'clear_reply') onClearReplyHistory?.();
                                        else if (confirmAction.type === 'delete_ask') onDeleteAskHistoryItem?.(confirmAction.id);
                                        else if (confirmAction.type === 'delete_reply') onDeleteReplyHistoryItem?.(confirmAction.id);
                                        setConfirmAction(null);
                                    }}
                                    className="flex-1 rounded-full bg-red-500/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300 transition hover:bg-red-500/25 border border-red-500/10 hover:border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-[#16172a] via-[#0f1018] to-[#0a0a0d] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        <Sparkles size={18} className="text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
                        <p className="text-[10px] text-violet-300/60 uppercase tracking-[0.2em] font-medium">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowHistoryToggle(!showHistoryToggle)}
                        className={`px-3 py-2 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 ${showHistoryToggle ? 'bg-violet-600/20 text-violet-300' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
                        title={mode === 'ask' ? 'Toggle Ask AI History' : 'Toggle Generated Reply History'}
                    >
                        <History size={18} strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                            {mode === 'ask' ? 'Ask History' : 'Reply History'}
                        </span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="sticky top-[77px] z-10 px-6 pt-4 pb-3 bg-[#050507]/95 backdrop-blur-xl border-b border-white/5">
                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                    <button
                        onClick={() => onModeChange?.('ask')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'ask' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Ask AI
                    </button>
                    <button
                        onClick={() => onModeChange?.('replies')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'replies' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Generate Reply
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
                {showHistoryToggle ? (
                    <>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-sm font-bold text-white tracking-wide">
                                {mode === 'ask' ? 'Ask AI History' : 'Reply History'}
                            </h4>
                            <button
                                onClick={() => setConfirmAction({ type: mode === 'ask' ? 'clear_ask' : 'clear_reply', id: null })}
                                className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-200 transition hover:bg-red-500/15"
                            >
                                Clear History
                            </button>
                        </div>
                        
                        {mode === 'ask' && (
                            <div className="space-y-4">
                                <div 
                                    onClick={() => {
                                        onNewAskChat?.();
                                        setShowHistoryToggle(false);
                                    }}
                                    className="group flex items-center gap-4 px-4 h-[52px] rounded-[16px] bg-[#1c1c1e]/80 hover:bg-[#2c2c2e] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                >
                                    <MessageSquarePlus size={18} className="text-neutral-400 group-hover:text-white transition-colors" strokeWidth={2} />
                                    <p className="text-[15px] text-white font-medium">New chat</p>
                                </div>
                                {askHistory.length > 0 ? (
                                    askHistory.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => {
                                                setShowHistoryToggle(false);
                                                onContinueAskHistory?.(item);
                                            }}
                                            className="group relative flex items-center justify-between p-4 rounded-[16px] bg-[#1c1c1e]/50 hover:bg-[#2c2c2e] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-[15px] text-neutral-200 font-medium truncate">
                                                    {item.question}
                                                </p>
                                                <p className="text-[12px] text-neutral-500 mt-1 font-medium">
                                                    {new Date(item.createdAt).toLocaleString('en-GB', { 
                                                        day: '2-digit', month: '2-digit', year: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmAction({ type: 'delete_ask', id: item.id });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                title="Delete this Ask AI history"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-2">
                                            <Bot size={32} className="text-violet-400" />
                                        </div>
                                        <p className="text-sm text-neutral-300 font-medium">No Ask AI history yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'replies' && (
                            <div className="space-y-5">
                                {history.length > 0 ? (
                                    <div className="grid gap-3">
                                        {history.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="group relative flex items-center justify-between p-4 rounded-[16px] bg-[#1c1c1e]/50 hover:bg-[#2c2c2e] border border-transparent transition-all"
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-[15px] text-neutral-200 font-medium truncate">
                                                    {item.sentReply || item.contextSummary || "Generated Reply"}
                                                </p>
                                                <p className="text-[12px] text-neutral-500 mt-1 font-medium">
                                                    {new Date(item.createdAt).toLocaleString('en-GB', { 
                                                        day: '2-digit', month: '2-digit', year: 'numeric', 
                                                        hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmAction({ type: 'delete_reply', id: item.id });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                title="Delete this reply history"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                        <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-2">
                                            <Bot size={32} className="text-violet-400" />
                                        </div>
                                        <p className="text-sm text-neutral-300 font-medium">No Reply History yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                {mode === 'ask' && messages.length === 0 && !isLoading && (
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
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
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
                                    ease: "easeInOut" 
                                }}
                                className="relative w-24 h-24 rounded-full bg-[#1c1c1e] border-2 border-white/5 flex items-center justify-center shadow-2xl z-10"
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

                {mode === 'ask' && messages.map((msg, idx) => {
                    const parsedSteps = msg.role === 'ai' ? parseStructuredSteps(msg.text) : null;
                    
                    return (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 ml-1">
                                    <Bot size={13} className="text-violet-400" />
                                    <span className="text-[10px] uppercase tracking-[0.15em] text-violet-300/80 font-bold font-mono">CLI-Q_AGENT</span>
                                </div>
                            )}

                            <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-900/20' 
                                    : 'bg-white/5 border border-white/10 text-neutral-300 rounded-tl-sm backdrop-blur-xl'
                            } max-w-[92%]`}>
                                {msg.role === 'user' ? (
                                    msg.text
                                ) : parsedSteps ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                                <Brain size={16} className="text-violet-300" />
                                            </div>
                                            <span className="text-white font-bold text-[14px]">{parsedSteps.title}</span>
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
                                                    <span className="text-neutral-200 text-[13px] font-medium leading-relaxed">{step}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>
                                        {msg.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    );
                })}

                {mode === 'ask' && isLoading && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Thinking Process Visualizer - Only show during analysis/thinking phases */}
                        {['analysing', 'thinking'].includes(thinkingStep) && (
                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                                <h5 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-3 px-1">AI Thinking Process</h5>
                                <ThinkingStep icon={Search} label="Analysing past chat" status={['thinking', 'generating', 'refining'].includes(thinkingStep) ? 'completed' : 'active'} />
                                <ThinkingStep icon={Brain} label="Thinking" status={['generating', 'refining'].includes(thinkingStep) ? 'completed' : thinkingStep === 'analysing' ? 'pending' : 'active'} />
                                <ThinkingStep icon={Wand2} label="Generating" status={['refining'].includes(thinkingStep) ? 'completed' : ['analysing', 'thinking'].includes(thinkingStep) ? 'pending' : 'active'} />
                                <ThinkingStep icon={CheckCircle2} label="Refining" status={thinkingStep === 'refining' ? 'active' : 'pending'} />
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

                {mode === 'replies' && (
                    <div className="space-y-4">
                        <div className="space-y-2 px-1 relative z-20">
                            <SectionLabel icon={MessageSquarePlus} className="!mb-0">Tone Selection</SectionLabel>
                            
                            <div className="relative">
                                <button
                                    onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                                    className="w-full flex items-center justify-between bg-[#0a0a0d] border border-white/5 rounded-xl px-4 py-2.5 transition-colors hover:border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[16px]">{tones.find(t => t.key === selectedTone)?.emoji || '😎'}</span>
                                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-violet-200">
                                            {selectedTone}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ${toneDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {toneDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1 grid grid-cols-2 gap-1 max-h-[180px] overflow-y-auto scrollbar-hide"
                                        >
                                            {tones.map(({ key, emoji }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        onToneChange?.(key);
                                                        setToneDropdownOpen(false);
                                                    }}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                        selectedTone === key
                                                            ? 'bg-violet-600/20 text-violet-200'
                                                            : 'hover:bg-white/5 text-neutral-400 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="text-[15px]">{emoji}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{key}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-2 px-1">
                            <SectionLabel icon={Smile} className="!mb-0">Emoji Preference</SectionLabel>
                            <div className="flex bg-[#0a0a0d] rounded-xl p-1 border border-white/5 relative isolate overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-1 rounded-lg bg-violet-600/30 border border-violet-500/30 -z-10"
                                    initial={false}
                                    animate={{
                                        left: emojiPreference === 'both' ? '0.25rem' : emojiPreference === 'with' ? '33.33%' : '66.66%',
                                        width: 'calc(33.33% - 0.25rem)'
                                    }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                                {[
                                    { key: 'both', label: 'Balanced', icon: null },
                                    { key: 'with', label: 'More Emoji', icon: <Smile size={14} className="mb-0.5" /> },
                                    { key: 'without', label: 'No Emoji', icon: null },
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => onEmojiPreferenceChange?.(opt.key)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                                            emojiPreference === opt.key ? 'text-violet-200' : 'text-neutral-500 hover:text-neutral-300'
                                        }`}
                                    >
                                        {opt.icon}{opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-1">
                            <button
                                onClick={() => onGenerateReplies?.()}
                                disabled={replyLoading}
                                className="relative w-full overflow-hidden rounded-2xl group transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-[0.05]" />
                                <div className="relative px-6 py-3 flex items-center justify-center gap-3">
                                    {replyLoading ? (
                                        <Loader2 size={18} className="animate-spin text-white" />
                                    ) : (
                                        <Wand2 size={18} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                    )}
                                    <span className="text-[14px] font-bold tracking-wide text-white drop-shadow-md">
                                        {replyLoading ? "Generating Magic..." : "Generate Smart Replies"}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {replyLoading && (
                            <SectionCard className="animate-pulse space-y-4 border-violet-500/20 bg-violet-500/[0.02]">
                                <div className="h-3 w-24 rounded bg-violet-500/20" />
                                <div className="space-y-3">
                                    <div className="h-4 w-3/4 rounded bg-white/10" />
                                    <div className="h-4 w-full rounded bg-white/[0.06]" />
                                    <div className="h-4 w-5/6 rounded bg-white/[0.06]" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-8 w-16 rounded-full bg-white/[0.06]" />
                                    <div className="h-8 w-24 rounded-full bg-emerald-500/10" />
                                </div>
                            </SectionCard>
                        )}

                        {!replyLoading && error && (
                            <SectionCard className="border-red-500/20 bg-red-500/10 space-y-4">
                                <div>
                                    <SectionLabel className="text-red-300">Reply Generator Unavailable</SectionLabel>
                                    <p className="mt-1 text-[13px] leading-relaxed text-red-200">{error}</p>
                                </div>
                                <button
                                    onClick={() => onGenerateReplies?.()}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-white/15"
                                >
                                    <Wand2 size={14} />
                                    Try Again
                                </button>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && !replyData?.top_reply && !replyData?.reply_suggestions?.length && (
                            <SectionCard className="flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10 bg-transparent">
                                <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                                    <Bot size={32} className="text-violet-400" />
                                </div>
                                <h4 className="text-[15px] font-bold text-white tracking-wide mb-2">Ready to assist</h4>
                                <p className="text-[13px] text-neutral-400 max-w-[240px] leading-relaxed">Choose a tone and tap <span className="font-semibold text-white">Generate</span> to create smart message suggestions.</p>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && (replyData?.context_preview || aiUnderstandingParagraph || replyData?.last_other_message) && (
                            <div className="grid gap-3 md:grid-cols-2">
                                <SectionCard>
                                    <SectionLabel icon={History}>Actual Context</SectionLabel>
                                    {replyData?.context_preview ? (
                                        <div className="rounded-xl bg-black/20 p-3 border border-white/[0.03]">
                                            <pre className="whitespace-pre-wrap text-[13px] text-neutral-300 font-sans leading-relaxed">{replyData.context_preview}</pre>
                                        </div>
                                    ) : (
                                        <p className="text-[13px] text-neutral-500 italic">No recent chat context.</p>
                                    )}
                                    {replyData?.last_other_message && (
                                        <div className="mt-3 rounded-xl border border-violet-500/10 bg-violet-500/[0.02] p-3">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/70 font-bold mb-1.5">Last Message</p>
                                            <p className="text-[13px] text-neutral-200">{replyData.last_other_message}</p>
                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard>
                                    <SectionLabel icon={Brain}>AI Understanding</SectionLabel>
                                    <p className="text-[13.5px] leading-relaxed text-neutral-300">
                                        {aiUnderstandingParagraph || "The assistant is still forming an interpretation of the conversation context."}
                                    </p>
                                    {replyData?.detected_intent && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                                                <span className="text-neutral-500">Intent: </span>
                                                <span className="text-pink-300">{replyData.detected_intent}</span>
                                            </div>
                                            <div className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                                                <span className="text-neutral-500">Tone: </span>
                                                <span className="text-violet-300">{replyData.tone || selectedTone}</span>
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>
                            </div>
                        )}

                        {!replyLoading && !error && replyData?.safety_message && (
                            <SectionCard className="border-amber-500/20 bg-amber-500/10">
                                <SectionLabel className="text-amber-400">Safety Notice</SectionLabel>
                                <p className="text-[13px] leading-relaxed text-amber-200/90">{replyData.safety_message}</p>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && replyData?.top_reply && (
                            <SectionCard>
                                <SectionLabel icon={Sparkles} className="!text-violet-400">Top Recommendation</SectionLabel>
                                {renderReplyCard(replyData.top_reply, 'top-reply', { highlighted: true })}
                            </SectionCard>
                        )}

                        {!replyLoading && !error && groupedReplies.length > 0 && (
                            <SectionCard>
                                <SectionLabel icon={MessageSquarePlus}>Categorized Options</SectionLabel>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {groupedReplies.map((item) => renderReplyCard(item.value, item.label, { label: item.label }))}
                                </div>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && replyData?.reply_suggestions?.length > 0 && (
                            <SectionCard>
                                <SectionLabel icon={Wand2}>More Suggestions</SectionLabel>
                                <div className="grid gap-2">
                                    {replyData.reply_suggestions.map((item, index) => renderReplyCard(item, `suggestion-${index}`))}
                                </div>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && emojiRepliesWith.length > 0 && (
                            <SectionCard>
                                <SectionLabel className="!text-pink-300">With Emojis</SectionLabel>
                                <div className="grid gap-2">
                                    {emojiRepliesWith.map((item, index) => renderReplyCard(item, `emoji-with-${index}`))}
                                </div>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && emojiRepliesWithout.length > 0 && (
                            <SectionCard>
                                <SectionLabel>Without Emojis</SectionLabel>
                                <div className="grid gap-2">
                                    {emojiRepliesWithout.map((item, index) => renderReplyCard(item, `emoji-without-${index}`))}
                                </div>
                            </SectionCard>
                        )}

                        {!replyLoading && !error && rewrites.length > 0 && (
                            <SectionCard>
                                <SectionLabel>Rewrite Options</SectionLabel>
                                <div className="grid gap-2">
                                    {rewrites.map((item, index) => renderReplyCard(item, `rewrite-${index}`))}
                                </div>
                            </SectionCard>
                        )}

                    </div>
                )}
                    </>
                )}
            </div>

            {/* Footer / Input */}
            {mode === 'ask' && !showHistoryToggle && (
            <div className="sticky bottom-0 z-20 px-6 py-4 border-t border-white/5 bg-[#0a0a0d]/95 backdrop-blur-xl space-y-3">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-3 py-2 flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => onInputChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit?.();
                            }
                        }}
                        placeholder="Ask Message AI about this conversation..."
                        className="flex-1 resize-none bg-transparent px-2 py-2 text-[14px] text-white outline-none placeholder-neutral-500 max-h-32 scrollbar-hide"
                    />
                    <button
                        onClick={() => onSubmit?.()}
                        disabled={isLoading || !inputValue.trim()}
                        className="rounded-full bg-violet-600 p-3 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Send"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                    </button>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 text-[11px] px-1">
                    <Info size={12} />
                    <span>Answers usually use this chat context, but general messaging questions may get broader guidance.</span>
                </div>
            </div>
            )}
        </motion.div>
    );
}
