import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import { User, MessageSquare, Search } from "lucide-react";

import MyConnectionShimmering from "./shimmering/MyConnectionShimmering";

export default function MessagesInbox() {
    const navigate = useNavigate();
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

    return (
        <div className="w-full relative px-4 max-w-4xl mx-auto">
            <div className="sticky top-0 bg-neutral-950 z-10 pt-4 pb-4 border-b border-neutral-800 mb-6">
                <h2 className="text-3xl font-bold text-white mb-4">
                    Messages
                </h2>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-neutral-800 rounded-xl leading-5 bg-neutral-900 text-neutral-300 placeholder-neutral-500 focus:outline-none focus:bg-neutral-800 focus:border-neutral-700 transition duration-150 ease-in-out sm:text-sm"
                        placeholder="Search messages by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {connections.length === 0 ? (
                <div className="text-center text-neutral-400 mt-10">
                    You have no messages yet.
                </div>
            ) : filteredConnections.length === 0 ? (
                <div className="text-center text-neutral-400 mt-10">
                    No messages found matching "{searchQuery}".
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredConnections.map((conn) => {
                        const user = conn;
                        if (!user || (!user.targetUserId && !user.id)) return null;

                        const targetId = user.targetUserId || user.id;

                        return (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 group"
                            >
                                {/* Left Section - Profile Info */}
                                <Link to={`/user/${targetId}`} className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border-[2px] border-neutral-800 group-hover:border-neutral-700 transition-colors shrink-0">
                                        <img
                                            src={avatar(user?.imageUrl)}
                                            alt={user?.name || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-[15px] text-white truncate">
                                            {user.name}
                                        </span>
                                        <span className={`text-[13px] truncate mt-0.5 ${user.lastMessage === "Start a new chat" ? "text-[#007aff]" : "text-neutral-400"}`}>
                                            {user.lastMessage}
                                        </span>
                                    </div>
                                </Link>

                                {/* Right Section - Action Buttons */}
                                <div className="flex items-center gap-3 ml-4">
                                    <button
                                        onClick={() => navigate(`/chat/${targetId}`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full text-sm font-semibold transition-colors shrink-0 shadow-sm"
                                    >
                                        <MessageSquare size={16} className="fill-black/5" />
                                        <span>Message</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
