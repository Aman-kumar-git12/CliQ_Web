import { useEffect, useState, useMemo, useRef } from "react";
import * as chatApi from "../../api/chat";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MyConnectionShimmering from "../shimmering/MyConnectionShimmering";
import { avatarUrl } from "../../utils/avatar";

// Columns 2: Conversation List
export default function ChatInbox() {
    const navigate = useNavigate();
    const location = useLocation();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    // Only the most recent conversations request may update the list (an older, slower one is ignored)
    const latestRequestRef = useRef(0);
    const connectionsRef = useRef(connections);

    useEffect(() => {
        connectionsRef.current = connections;
    }, [connections]);

    useEffect(() => {
        const controller = new AbortController();
        const requestId = ++latestRequestRef.current;
        const fetchConnections = async () => {
            try {
                const data = await chatApi.getConversations({ silent: true, signal: controller.signal });
                // A newer reload already filled the list; just stop the loading state
                if (requestId === latestRequestRef.current) {
                    if (Array.isArray(data)) setConnections(data);
                    else if (data.conversations) setConnections(data.conversations);
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                if (requestId === latestRequestRef.current) {
                    console.error("Error fetching connections:", err);
                    setError("Failed to load connections.");
                }
            }
            setLoading(false);
        };
        fetchConnections();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        let unmounted = false;
        const controller = new AbortController();

        // A conversation that isn't in the list yet: reload the whole list
        const reloadConversations = async () => {
            const requestId = ++latestRequestRef.current;
            try {
                const data = await chatApi.getConversations({ signal: controller.signal });
                if (unmounted || requestId !== latestRequestRef.current) return;
                if (Array.isArray(data)) setConnections(data);
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error("Error refreshing conversations:", err);
            }
        };

        const isListed = (list, targetId) => list.some((c) => String(c.targetUserId || c.id) === String(targetId));

        const handleChatUpdate = (event) => {
            const { targetId, lastMessage } = event.detail;
            if (!isListed(connectionsRef.current, targetId)) {
                reloadConversations();
                return;
            }
            setConnections((prev) => {
                const updatedList = [...prev];
                const index = updatedList.findIndex((c) => String(c.targetUserId || c.id) === String(targetId));
                if (index !== -1) {
                    const [item] = updatedList.splice(index, 1);
                    return [
                        {
                            ...item,
                            lastMessage: lastMessage || item.lastMessage,
                            lastMessageTime: new Date().toISOString(),
                        },
                        ...updatedList,
                    ];
                }
                return prev;
            });
        };
        window.addEventListener("chatUpdated", handleChatUpdate);
        return () => {
            unmounted = true;
            controller.abort();
            window.removeEventListener("chatUpdated", handleChatUpdate);
        };
    }, []);

    const formatConversationTime = (value) => {
        if (!value) return "";
        const date = new Date(value);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const filteredConnections = useMemo(() => {
        if (!searchQuery.trim()) return connections;
        const query = searchQuery.toLowerCase();
        return connections.filter((conn) => (conn.name || "").toLowerCase().includes(query));
    }, [connections, searchQuery]);

    if (loading) return <MyConnectionShimmering />;
    if (error) return <div className="text-center mt-10 px-6 text-sm text-red-400">{error}</div>;

    const targetIdMatch = location.pathname.match(/\/messages\/([a-zA-Z0-9_-]+)/);
    const activeTargetId = targetIdMatch ? targetIdMatch[1] : null;

    return (
        <div className="w-full h-full flex flex-col bg-surface-800/60 backdrop-blur-2xl text-white select-none relative z-10 border-r border-line-soft">
            <div className="pt-8 px-6 pb-6 bg-gradient-to-b from-black/20 to-transparent relative overflow-hidden">
                {/* Background Glow for Header */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="flex items-center gap-4 mb-6">
                    <button
                        type="button"
                        aria-label="Go back"
                        onClick={() => navigate(-1)}
                        className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-line text-white/80 hover:text-white hover:bg-white/[0.06] transition duration-150 ease-soft active:scale-95 group focus-ring"
                    >
                        <ArrowLeft
                            size={20}
                            strokeWidth={2.5}
                            className="group-hover:-translate-x-0.5 transition-transform duration-150 ease-soft"
                        />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-brand to-brand-pink shadow-[0_0_10px_rgba(139,92,246,0.5)] md:hidden" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-300 md:hidden">
                                Messaging Module
                            </span>
                        </div>
                        <h2 className="text-[28px] md:text-[32px] font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                            MESSAGES
                        </h2>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-300 group-focus-within:text-brand-light transition-colors duration-150">
                        <Search className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3.5 border border-line-soft rounded-[22px] bg-white/[0.03] text-white placeholder:text-ink-300 focus:outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10 focus:bg-white/[0.05] transition-[border-color,box-shadow,background-color] duration-200 ease-soft text-[16px] md:text-[14px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] font-medium"
                        placeholder="Search CLIQ..."
                        aria-label="Search conversations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
                <div className="flex flex-col gap-1 py-2">
                    {filteredConnections.map((user) => {
                        const targetId = user.targetUserId || user.id;
                        const isSelected = targetId === activeTargetId;

                        return (
                            <button
                                type="button"
                                key={user.id}
                                onClick={() => navigate(`/messages/${targetId}`)}
                                aria-current={isSelected ? "page" : undefined}
                                className="w-full text-left relative cursor-pointer group h-[88px] flex items-center px-4 gap-4 transition-colors duration-150 ease-soft rounded-[24px] overflow-hidden hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
                            >
                                {/* Shared Active Background */}
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="active-chat-glow"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 38,
                                                mass: 1,
                                            }}
                                            className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-brand/[0.14] to-brand-pink/[0.08] border border-brand/20 z-0 shadow-[inset_20px_0_20px_-20px_rgba(139,92,246,0.3),0_8px_16px_rgba(0,0,0,0.2)]"
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative shrink-0 z-10">
                                    <div
                                        className={`w-[56px] h-[56px] rounded-full overflow-hidden border transition duration-200 ease-soft shadow-lg ${isSelected ? "border-line-strong p-[2px] bg-gradient-to-br from-brand to-brand-pink scale-105" : "border-line p-[1px] bg-surface-700 group-hover:border-line-strong group-hover:scale-105"}`}
                                    >
                                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                            {user?.imageUrl ? (
                                                <img
                                                    loading="lazy"
                                                    decoding="async"
                                                    src={avatarUrl(user?.imageUrl)}
                                                    alt="" // the name is shown right next to it in the same button
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-600 to-surface-800">
                                                    <span className="text-xl font-black text-white/60">
                                                        {(user?.name || "U").charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-brand to-brand-pink border-[3px] border-surface-800 rounded-full shadow-lg z-20" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pr-2 relative z-10">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span
                                            className={`text-[15px] font-black truncate tracking-tight transition-colors ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}
                                        >
                                            {user.name}
                                        </span>
                                        <span
                                            className={`text-[10px] font-black tracking-widest uppercase transition-colors shrink-0 ${isSelected ? "text-brand-light" : "text-ink-300 group-hover:text-ink-200"}`}
                                        >
                                            {formatConversationTime(user.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <p
                                            className={`text-[13px] truncate font-semibold leading-tight transition-colors duration-150 ${isSelected ? "text-white/90" : "text-white/50 group-hover:text-white/75"} ${user.lastMessage === "Start a new chat" ? "text-brand-pink italic opacity-80" : ""}`}
                                        >
                                            {user.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
