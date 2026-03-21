import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, MessageSquare, Search, ArrowLeft } from "lucide-react";

import MyConnectionShimmering from "./shimmering/MyConnectionShimmering";



export default function MessagesInbox() {
    const navigate = useNavigate();
    const location = useLocation();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                // Fetch conversations which are already sorted by latest message
                const res = await axiosClient.get("/chat/conversations");
                if (Array.isArray(res.data)) {
                    setConnections(res.data);
                } else if (res.data.conversations && Array.isArray(res.data.conversations)) {
                    setConnections(res.data.conversations);
                } else {
                    setConnections([]);
                }
            } catch (err) {
                console.error("Error fetching connections:", err);
                setError("Failed to load connections.");
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    // Real-time sorting and updates
    useEffect(() => {
        const handleChatUpdate = (event) => {
            const { targetId, lastMessage } = event.detail;

            setConnections(prev => {
                const updatedList = [...prev];
                const index = updatedList.findIndex(c => String(c.targetUserId || c.id) === String(targetId));

                if (index !== -1) {
                    const [item] = updatedList.splice(index, 1);
                    return [{ ...item, lastMessage: lastMessage || item.lastMessage }, ...updatedList];
                } else {
                    // If user not in list (new chat), fetch list again
                    axiosClient.get("/chat/conversations").then(res => {
                        if (Array.isArray(res.data)) setConnections(res.data);
                        else if (res.data.conversations) setConnections(res.data.conversations);
                    });
                    return prev;
                }
            });
        };

        window.addEventListener('chatUpdated', handleChatUpdate);
        return () => window.removeEventListener('chatUpdated', handleChatUpdate);
    }, []);

    const avatar = (img) =>
        img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    const filteredConnections = useMemo(() => {
        if (!searchQuery.trim()) return connections;
        const query = searchQuery.toLowerCase();
        return connections.filter(conn => {
            const user = conn;
            if (!user) return false;
            const fullName = (user.name || "").toLowerCase();
            return fullName.includes(query);
        });
    }, [connections, searchQuery]);

    if (loading) {
        return <MyConnectionShimmering />;
    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-500">
                {error}
            </div>
        );
    }

    const targetIdMatch = location.pathname.match(/\/messages\/([a-zA-Z0-9_-]+)/);
    const activeTargetId = targetIdMatch ? targetIdMatch[1] : null;
    const activeIndex = filteredConnections.findIndex(conn => {
        if (!conn) return false;
        return (conn.targetUserId || conn.id) === activeTargetId;
    });

    return (
        <div className="w-full h-full flex flex-col bg-transparent lg:bg-black/90 backdrop-blur-xl border-r border-neutral-800/50">
            <div className="pt-8 px-4 pb-4">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate('/home')} className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-full transition-colors active:scale-95">
                        <ArrowLeft size={26} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-3xl font-extrabold text-white tracking-tighter shadow-sm">
                        Messages
                    </h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-2 border border-neutral-800 rounded-xl bg-neutral-900/50 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-600/50 focus:border-red-600/50 transition-all text-sm shadow-inner"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Separator Line */}
            <div className="mx-6 h-px bg-neutral-800/50 shrink-0"></div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide pt-2 pb-4">
                {connections.length === 0 ? (
                    <div className="text-center text-neutral-500 mt-10 text-sm">
                        No conversations yet.
                    </div>
                ) : filteredConnections.length === 0 ? (
                    <div className="text-center text-neutral-500 mt-10 text-sm">
                        No results found.
                    </div>
                ) : (
                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-1">
                        {/* The sliding active background */}
                        {activeIndex >= 0 && (
                            <div 
                                className="absolute left-0 right-0 w-full pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0"
                                style={{ 
                                    height: '80px', 
                                    transform: `translateY(${activeIndex * 80}px)` 
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-600/5 to-transparent backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-y border-red-600/10" />
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] rounded-r-sm" />
                            </div>
                        )}

                        <div className="flex flex-col relative z-10 pointer-events-auto">
                            {filteredConnections.map((conn) => {
                                const user = conn;
                                if (!user || (!user.targetUserId && !user.id)) return null;

                                const targetId = user.targetUserId || user.id;
                                const isSelected = targetId === activeTargetId;

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => navigate(`/messages/${targetId}`)}
                                        className="relative cursor-pointer group h-[80px]"
                                    >
                                        {/* Hover Background (Inactive) */}
                                        <div className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
                                        
                                        {/* Inner Content Wrapper popping forward */}
                                        <div className={`relative flex items-center gap-4 px-4 h-full w-full transition-transform duration-500 ease-out origin-center ${!isSelected ? 'group-hover:scale-[1.04] z-10' : 'scale-100'}`}>
                                            
                                            <div className="relative shrink-0 flex items-center h-full">
                                                <div className={`w-12 h-12 rounded-full overflow-hidden border transition-all duration-500 ease-out ${isSelected ? 'border-red-500 ring-2 ring-red-500/30' : 'border-neutral-800 bg-neutral-900 group-hover:border-neutral-600'}`}>
                                                    <img
                                                        src={avatar(user?.imageUrl)}
                                                        alt={user?.name || "User"}
                                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className={`text-[14px] font-semibold truncate transition-colors duration-300 ${isSelected ? "text-white" : "text-neutral-200"}`}>
                                                        {user.name}
                                                    </span>
                                                </div>
                                                <p className={`text-[12px] truncate transition-colors duration-300 ${user.lastMessage === "Start a new chat" ? "text-red-500/80 font-medium" : (isSelected ? "text-neutral-300" : "text-neutral-500")}`}>
                                                    {user.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
