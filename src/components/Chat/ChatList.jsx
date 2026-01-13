import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, MessageSquarePlus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingChat from './LoadingChat';

const ChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axiosClient.get('/chat/conversations');
                setConversations(res.data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (loading) return <LoadingChat />;

    return (
        <div className="h-screen bg-black text-[#f2f2f7] flex flex-col relative overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-neutral-800/50 px-4 py-3 sticky top-0 z-20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/home')}
                            className="p-1 -ml-1 text-[#007aff] hover:bg-white/5 rounded-full transition-colors active:scale-90"
                        >
                            <ArrowLeft size={28} />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
                    </div>
                    <div className="flex items-center gap-4 text-[#007aff]">
                        <button className="p-1 hover:bg-white/5 rounded-full transition-colors active:scale-90">
                            <MoreVertical size={22} />
                        </button>
                        <button className="p-1 hover:bg-white/5 rounded-full transition-colors active:scale-90">
                            <MessageSquarePlus size={22} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8e8e93]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2c2c2e] text-white pl-10 pr-4 py-2 rounded-xl outline-none placeholder:text-[#8e8e93] text-[16px] focus:ring-1 focus:ring-[#007aff]/50 transition-all"
                    />
                </div>
            </div>

            {/* Chat List Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 px-12 text-center text-[#8e8e93]">
                        <p className="text-[14px]">No conversations found</p>
                    </div>
                ) : (
                    <div className="space-y-[1px]">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => navigate(`/chat/${conv.targetUserId}`)}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1c1c1e] transition-colors active:bg-[#2c2c2e] group"
                            >
                                {/* Avatar */}
                                <div className="w-[52px] h-[52px] rounded-full bg-[#3a3a3c] flex items-center justify-center text-xl font-bold border border-white/5 ring-1 ring-black/20 shrink-0 overflow-hidden">
                                    {conv.imageUrl ? (
                                        <img src={conv.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        conv.name?.[0]?.toUpperCase() || "?"
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-center min-w-0 border-b border-neutral-800/30 pb-3 group-last:border-none">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-semibold text-[16px] truncate text-[#f2f2f7]">{conv.name}</h3>
                                        <span className="text-[12px] text-[#8e8e93] shrink-0">{formatTime(conv.lastMessageTime)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[14px] text-[#8e8e93] truncate pr-4">
                                            {conv.lastMessage}
                                        </p>
                                        {/* Optional: Unread dot would go here */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ChatList;
