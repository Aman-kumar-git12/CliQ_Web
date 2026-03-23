import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Menu, PlusCircle, Trash2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUserContext } from '../../context/userContext';
import axiosClient from "../../api/axiosClient";

export default function Chatbot() {
    const { user: currentUser } = useUserContext();
    const [isOpen, setIsOpen] = useState(false);
    
    // Multi-session states
    const [showSidebar, setShowSidebar] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null });

    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { id: 'greeting1', role: 'ai', text: "Hello! What query can I help you solve today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Fetch all sessions when chatbot opens
    useEffect(() => {
        if (isOpen && currentUser) {
            loadSessions();
        }
    }, [isOpen, currentUser]);

    const isHistoryLoad = useRef(false);

    // Fetch specific chat history when active session changes
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const loadHistory = async () => {
            if (!activeSessionId) {
                // Initial fresh state
                isHistoryLoad.current = true;
                setMessages([{ id: 'g1', role: 'ai', text: "Hello! What query can I help you solve today?" }]);
                return;
            }

            setIsLoading(true);
            try {
                const { data } = await axiosClient.get(`/aichat/history/${activeSessionId}`);
                isHistoryLoad.current = true;
                if (data.messages && data.messages.length > 0) {
                    const historyMessages = data.messages.map((msg) => ({
                        id: msg.id,
                        role: msg.role,
                        text: msg.text
                    }));
                    setMessages(historyMessages);
                } else {
                    setMessages([{ id: 'g2', role: 'ai', text: "Hello! What query can I help you solve today?" }]);
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [activeSessionId, isOpen, currentUser]);

    useEffect(() => {
        if (!showSidebar) {
           const behavior = isHistoryLoad.current ? 'auto' : 'smooth';
           messagesEndRef.current?.scrollIntoView({ behavior });
           isHistoryLoad.current = false;
        }
    }, [messages, showSidebar]);

    const loadSessions = async () => {
        try {
            const { data } = await axiosClient.get("/aichat/sessions");
            setSessions(data.sessions || []);
            // Set first session as active if none selected
            if (!activeSessionId && data.sessions && data.sessions.length > 0) {
                setActiveSessionId(data.sessions[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const handleCreateNewChat = () => {
        setActiveSessionId(null);
        setShowSidebar(false);
        setMessages([{ id: 'g3', role: 'ai', text: "Hello! What query can I help you solve today?" }]);
    };

    const requestDeleteSession = (e, id) => {
        e.stopPropagation();
        setDeleteConfirm({ isOpen: true, id, type: 'single' });
    };

    const confirmDeleteSession = async () => {
        const id = deleteConfirm.id;
        try {
            await axiosClient.delete(`/aichat/session/${id}`);
            setSessions(prev => prev.filter(s => s.id !== id));
            if (activeSessionId === id) {
                setActiveSessionId(null);
                setMessages([{ id: 'g4', role: 'ai', text: "Chat deleted. Hello! What query can I help you solve today?" }]);
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, type: null });
        }
    };

    const requestDeleteAll = () => {
        setDeleteConfirm({ isOpen: true, id: null, type: 'all' });
    };

    const confirmDeleteAll = async () => {
        try {
            await axiosClient.delete(`/aichat/sessions/all`);
            setSessions([]);
            setActiveSessionId(null);
            setMessages([{ id: 'g5', role: 'ai', text: "All history cleared. Hello! What query can I help you solve today?" }]);
        } catch (error) {
            console.error("Failed to clear all history", error);
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, type: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        
        const userQuery = query.trim();
        setQuery('');
        
        const newUserMsg = { id: Date.now(), role: 'user', text: userQuery };
        const aiMsgId = Date.now() + 1;
        setMessages(prev => [...prev, newUserMsg, { id: aiMsgId, role: 'ai', text: '' }]);
        setIsLoading(true);

        try {
            let targetSessionId = activeSessionId;
            
            // If no active session, create one first
            if (!targetSessionId) {
                const sessionRes = await axiosClient.post("/aichat/session");
                targetSessionId = sessionRes.data.session.id;
                setActiveSessionId(targetSessionId);
                // Also eagerly update the sessions list so it shows in sidebar
                setSessions(prev => [sessionRes.data.session, ...prev]);
            }

            // 1. Save user query
            await axiosClient.post("/aichat/save", { sessionId: targetSessionId, role: "user", text: userQuery });

            // 2. Stream generation
            // The python backend config expects unique strings to avoid memory collisions.
            const llmBaseUrl = import.meta.env.VITE_LLM_API_URL || 'http://localhost:8000';
            const response = await fetch(`${llmBaseUrl}/api/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userQuery, sessionId: targetSessionId })
            });

            if (!response.ok) throw new Error("API request failed");
            setIsLoading(false); 

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullAiAnswer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullAiAnswer += chunk;
                
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, text: msg.text + chunk } : msg
                ));
            }
            
            // 3. Save resulting AI generated text
            await axiosClient.post("/aichat/save", { sessionId: targetSessionId, role: "ai", text: fullAiAnswer });
            
            // Refresh sessions list subtly to capture updated titles
            const { data } = await axiosClient.get("/aichat/sessions");
            setSessions(data.sessions || []);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId ? { ...msg, text: "Sorry, I had trouble connecting." } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-4 w-[340px] sm:w-[400px] h-[500px] bg-[#0a0a0d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                                >
                                    <Menu size={16} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                                        <Bot size={18} className="text-violet-400" />
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-wide">
                                        {showSidebar ? "Chat History" : "AI Assistant"}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Custom Deletion Modal */}
                        <AnimatePresence>
                            {deleteConfirm.isOpen && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                                        className="bg-[#13131a] border border-white/10 rounded-2xl p-5 w-full max-w-[280px] flex flex-col items-center text-center shadow-xl shadow-red-900/10"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                                            <Trash2 className="text-red-400" size={24} />
                                        </div>
                                        <h3 className="text-white font-medium mb-1">Delete Chat?</h3>
                                        <p className="text-neutral-400 text-sm mb-5">
                                            {deleteConfirm.type === 'single' 
                                                ? "Are you sure you want to delete this conversation?" 
                                                : "Are you sure you want to clear all chat history?"}
                                        </p>
                                        <div className="flex w-full gap-3">
                                            <button 
                                                onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: null })}
                                                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={deleteConfirm.type === 'single' ? confirmDeleteSession : confirmDeleteAll}
                                                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {showSidebar ? (
                            /* Sidebar History View */
                            <div className="flex-1 overflow-y-auto bg-[#0d0d12] p-3 flex flex-col gap-2">
                                <button 
                                    onClick={handleCreateNewChat}
                                    className="w-full py-2.5 px-4 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors mb-2"
                                >
                                    <PlusCircle size={16} />
                                    New Chat
                                </button>

                                {sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                                        <MessageSquare size={24} className="opacity-50" />
                                        <span className="text-sm">No recent chats</span>
                                    </div>
                                ) : (
                                    sessions.map(session => (
                                        <div 
                                            key={session.id}
                                            onClick={() => {
                                                setActiveSessionId(session.id);
                                                setShowSidebar(false);
                                            }}
                                            className={`group w-full text-left px-3 py-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                                activeSessionId === session.id 
                                                    ? 'bg-white/10 border-white/20' 
                                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex flex-col truncate pr-2">
                                                <span className="text-sm text-neutral-200 font-medium truncate">
                                                    {session.title}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 mt-0.5">
                                                    {new Date(session.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => requestDeleteSession(e, session.id)}
                                                className="p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                                {sessions.length > 0 && (
                                    <button 
                                        onClick={requestDeleteAll}
                                        className="w-full mt-auto py-2.5 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Clear All History
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Chat Body View */
                            <>
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0d0d12]">
                                    {messages.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            className={`p-3 max-w-[85%] rounded-xl text-[13.5px] leading-relaxed shadow-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-violet-600 text-white rounded-tr-sm self-end shadow-violet-900/20'
                                                    : 'bg-white/5 border border-white/5 text-neutral-300 rounded-tl-sm self-start whitespace-pre-wrap'
                                            }`}
                                        >
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0 prose-strong:text-white prose-a:text-violet-400 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4 max-w-none text-[13.5px]">
                                                    <ReactMarkdown>
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="bg-white/5 border border-white/5 rounded-xl rounded-tl-sm p-4 max-w-[85%] self-start flex gap-1.5 items-center">
                                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }} />
                                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }} />
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-white/10 bg-[#0a0a0d]">
                                    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Ask me anything..."
                                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-full pl-4 pr-12 py-3 outline-none focus:border-violet-500/50 transition-colors placeholder:text-neutral-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!query.trim()}
                                            className="absolute right-1.5 w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-neutral-800 transition-all hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                        >
                                            <Send size={14} className="ml-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] border border-white/20 z-50 text-white relative overflow-hidden group"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X size={24} strokeWidth={2.5} /> : <Sparkles size={24} />}
            </motion.button>
        </div>
    );
}
