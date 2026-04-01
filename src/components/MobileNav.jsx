import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, MessageSquare, PlusSquare, User, Users } from "lucide-react";
import axiosClient from "../api/axiosClient";

const MobileNav = () => {
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);
    const activePath = location.pathname;

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await axiosClient.get("/user/requests");
                if (res.data?.connectionRequests) {
                    setPendingCount(res.data.connectionRequests.length);
                }
            } catch (err) {
                console.error("Error fetching mobile nav requests count:", err);
            }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 60000); // Polling every minute
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { path: "/home", icon: Home, label: "Feed" },
        { path: "/find/getconnection", icon: Compass, label: "Explore" },
        { path: "/create/post", icon: PlusSquare, label: "Create" },
        { path: "/requests", icon: Users, label: "Requests" },
        { path: "/profile", icon: User, label: "Me" },
    ];

    const isActive = (path) => {
        if (path === "/profile") return activePath.startsWith("/profile");
        if (path === "/requests") return activePath.startsWith("/requests");
        if (path === "/find/getconnection") return activePath.startsWith("/find");
        return activePath === path;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pointer-events-none">
            {/* Gradient Blur Dock: Custom masked blur for a professional app-like feel */}
            <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none backdrop-blur-xl"
                style={{
                    WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
                    maskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
                }}
            />

            <div className="relative w-full max-w-lg mx-auto pb-6 pt-2 px-4 pointer-events-auto">
                <div className="flex items-center justify-around bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    {/* Background accent glow: Subtler since we are more opaque */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-pink-500/10 pointer-events-none" />

                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-300"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-white/5 rounded-2xl"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}

                                <div className={`relative z-10 flex flex-col items-center gap-1 ${active ? "text-white" : "text-white/40"}`}>
                                    <div className="relative">
                                        <Icon
                                            size={active ? 22 : 20}
                                            className={`${active ? "text-[#a78bfa] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "transition-transform hover:scale-110"}`}
                                            strokeWidth={active ? 2.5 : 2}
                                        />
                                        {item.path === "/requests" && pendingCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a0f] shadow-[0_0_10px_rgba(236,72,153,0.4)]">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-0 scale-75"} transition-all duration-300`}>
                                        {item.label}
                                    </span>
                                </div>

                                {active && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileNav;
