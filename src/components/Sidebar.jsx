import React, { useState, useEffect } from "react";
import {
    Home,
    Compass,
    PlusSquare,
    User,
    Settings,
    MessageSquare,
    MoreHorizontal,
    Users
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axiosClient";

const NavItem = ({ to, icon: Icon, label, badge, active, isChatView }) => (
    <Link
        to={to}
        className={`flex items-center group relative h-[52px] transition-colors duration-200
            ${isChatView ? "justify-center w-[52px] mx-auto rounded-2xl" : "gap-4 px-5 rounded-[14px] mx-2"}
            ${active ? "bg-gradient-to-r from-violet-500/15 to-pink-500/10 text-white shadow-[inset_20px_0_20px_-20px_rgba(139,92,246,0.3),0_8px_16px_rgba(0,0,0,0.2)] border border-violet-500/20" : "text-white hover:bg-white/[0.06] hover:text-white"}`}
    >
        <div className="flex items-center justify-center w-6 h-6 shrink-0">
            <Icon size={22} className={`${active ? "text-[#a78bfa] drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-white group-hover:text-[#a78bfa] transition-colors"}`} />
        </div>

        <AnimatePresence mode="wait">
            {!isChatView && (
                <motion.span
                    key={`nav-label-${label}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-1 font-bold text-[14px] truncate ${active ? "text-white" : "text-white"}`}
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>

        {badge && (
            <span className={`bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white text-[10px] font-black rounded-full text-center shadow-[0_0_12px_rgba(236,72,153,0.4)]
                ${isChatView ? "absolute top-1 right-1 w-5 h-5 flex items-center justify-center border-2 border-[#12111d]" : "px-2 py-0.5 min-w-[20px] ml-auto"}`}>
                {badge}
            </span>
        )}
    </Link>
);

const Section = ({ title, children, isChatView }) => (
    <div className={`flex flex-col w-full mb-8 relative ${isChatView ? "items-center" : ""}`}>
        <AnimatePresence mode="wait">
            {!isChatView && (
                <motion.h3
                    key={`section-title-${title}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-black text-white/80 uppercase tracking-[0.25em] px-5 mb-4 flex items-center gap-3 overflow-hidden"
                >
                    {title}
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/[0.15] to-transparent rounded-full" />
                </motion.h3>
            )}
        </AnimatePresence>
        <div className={`flex flex-col gap-1.5 ${isChatView ? "w-full" : "px-2"}`}>
            {children}
        </div>
    </div>
);

export default function Sidebar() {
    const { user } = useUserContext();
    const location = useLocation();

    const isChatView = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    useEffect(() => {
        const fetchRequestsCount = async () => {
            try {
                const res = await axiosClient.get("/user/requests");
                if (res.data?.connectionRequests) {
                    setPendingRequestsCount(res.data.connectionRequests.length);
                }
            } catch (err) {
                console.error("Error fetching requests count:", err);
            }
        };

        fetchRequestsCount();
        // Refresh count every 60 seconds (simple polling)
        const interval = setInterval(fetchRequestsCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const isActive = (path) => {
        if (path === "/profile") return location.pathname.startsWith("/profile");
        if (path === "/messages") return location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
        if (path === "/find/getconnection") return location.pathname.startsWith("/find");
        return location.pathname === path;
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isChatView ? 90 : 260 }}
            transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
            className="fixed left-0 top-0 h-screen hidden md:flex flex-col bg-gradient-to-b from-[#12111d] via-[#0d0c15] to-[#0a0a0f] border-r border-white/10 z-50 shadow-[8px_0_32px_rgba(0,0,0,0.8)] overflow-hidden"
        >
            {/* LOGO (Fixed vertical position) */}
            <div className="flex items-center px-10 h-[120px] shrink-0">
                <Link to="/home" className={`flex items-center gap-4 group ${isChatView ? "w-full justify-center" : ""}`}>
                    <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.4)] group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <div className="w-4.5 h-4.5 border-[3.5px] border-white/50 rounded-full" />
                    </div>
                    <AnimatePresence mode="wait">
                        {!isChatView && (
                            <motion.h1
                                key="logo-text"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none whitespace-nowrap"
                            >
                                CLIQ
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* NAV BLOCKS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 scroll-smooth">
                <Section title="Feed" isChatView={isChatView}>
                    <NavItem to="/home" icon={Home} label="Feed" active={isActive("/home")} isChatView={isChatView} />
                    <NavItem to="/find/getconnection" icon={Compass} label="Explore" active={isActive("/find/getconnection")} isChatView={isChatView} />
                    <NavItem to="/requests" icon={Users} label="Requests" badge={pendingRequestsCount > 0 ? pendingRequestsCount.toString() : null} active={isActive("/requests")} isChatView={isChatView} />
                    <NavItem to="/messages" icon={MessageSquare} label="Messages" active={isActive("/messages")} isChatView={isChatView} />
                </Section>

                <Section title="Create" isChatView={isChatView}>
                    <NavItem to="/create/post" icon={PlusSquare} label="New Post" active={isActive("/create/post")} isChatView={isChatView} />
                </Section>

                <Section title="You" isChatView={isChatView}>
                    <NavItem to="/profile" icon={User} label="Profile" active={isActive("/profile")} isChatView={isChatView} />
                    <NavItem to="/settings" icon={Settings} label="Settings" active={isActive("/settings")} isChatView={isChatView} />
                </Section>
            </div>

            {/* USER CARD (Fixed height to prevent jump) */}
            {user && (
                <div className="mt-auto p-4 shrink-0 h-[88px] flex items-center justify-center">
                    <div className={`rounded-[20px] bg-[#0e0d14] border border-white/5 flex items-center group cursor-pointer hover:bg-white/[0.04] shadow-xl overflow-hidden h-14 transition-colors duration-300
                        ${isChatView ? "w-14 justify-center" : "p-3 gap-3 w-full"}`}>
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] p-[2px] shadow-lg group-hover:rotate-3 transition-transform shrink-0">
                            <div className="w-full h-full rounded-[12px] bg-black flex items-center justify-center text-white font-black text-xs">
                                {user.firstname?.substring(0, 1).toUpperCase() || "A"}
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                            {!isChatView && (
                                <motion.div
                                    key="user-info-box"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex flex-col min-w-0 flex-1 whitespace-nowrap overflow-hidden"
                                >
                                    <span className="text-[13px] font-black text-white truncate leading-none">
                                        {user.firstname} {user.lastname}
                                    </span>
                                    <span className="text-[9px] text-[#55516a] font-bold truncate tracking-tight uppercase mt-1">
                                        @{user.firstname?.toLowerCase()}_{user.lastname?.toLowerCase()}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!isChatView && <MoreHorizontal size={16} className="text-[#413c58] group-hover:text-white transition-colors" />}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
