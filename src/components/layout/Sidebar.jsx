import {
    Home,
    Compass,
    PlusSquare,
    User,
    Settings,
    MessageSquare,
    MoreHorizontal,
    Users,
    Bell,
    Search,
    Bookmark,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";
import { EASE_SOFT } from "../common/motionPresets";

const labelTransition = { duration: 0.2, ease: EASE_SOFT };

const NavItem = ({ to, icon: Icon, label, badge, active, isChatView }) => (
    <Link
        to={to}
        aria-current={active ? "page" : undefined}
        aria-label={isChatView ? label : undefined}
        title={isChatView ? label : undefined}
        // Every item has a 1px border (transparent when inactive), so selecting one doesn't nudge it by a pixel
        className={`flex items-center group relative h-[52px] border cliq-transition
            ${isChatView ? "justify-center w-[52px] mx-auto rounded-2xl" : "gap-4 px-5 rounded-[14px] mx-2"}
            ${active ? "bg-gradient-to-r from-brand/15 to-brand-pink/10 text-white border-brand/25 shadow-soft" : "text-ink-200 border-transparent hover:bg-white/[0.05] hover:text-ink-100"}`}
    >
        {/* Active marker on the left edge */}
        <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-brand-light cliq-transition ${active ? "h-5 opacity-100" : "h-0 opacity-0"}`}
        />
        <div className="flex items-center justify-center w-6 h-6 shrink-0">
            <Icon
                size={22}
                aria-hidden="true"
                className={`cliq-transition ${active ? "text-brand-light drop-shadow-glow" : "text-ink-300 group-hover:text-brand-light"}`}
            />
        </div>

        <AnimatePresence mode="wait">
            {!isChatView && (
                <motion.span
                    key={`nav-label-${label}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={labelTransition}
                    className="flex-1 font-bold text-[14px] truncate"
                >
                    {label}
                </motion.span>
            )}
        </AnimatePresence>

        {badge && (
            <span
                className={`bg-gradient-to-r from-brand to-brand-pink text-white text-[10px] font-black leading-none rounded-full text-center shadow-glow-pink tabular-nums
                ${isChatView ? "absolute top-1 right-1 min-w-5 h-5 px-1 flex items-center justify-center border-2 border-surface-sidebar" : "px-2 py-1 min-w-[20px] ml-auto"}`}
            >
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
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={labelTransition}
                    className="text-[11px] font-black text-ink-300 uppercase tracking-[0.25em] px-5 mb-4 flex items-center gap-3 overflow-hidden"
                >
                    {title}
                    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.12] to-transparent rounded-full" />
                </motion.h3>
            )}
        </AnimatePresence>
        <div className={`flex flex-col gap-1.5 ${isChatView ? "w-full" : "px-2"}`}>{children}</div>
    </div>
);

export default function Sidebar() {
    const { user } = useUserContext();
    const location = useLocation();

    const isChatView = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
    // Loaded and kept fresh by NotificationContext (also refreshed when a connection request arrives)
    const { unreadCount, pendingRequestsCount } = useNotifications();

    const isActive = (path) => {
        if (path === "/profile") return location.pathname.startsWith("/profile");
        if (path === "/messages")
            return location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
        if (path === "/find/getconnection") return location.pathname.startsWith("/find");
        return location.pathname === path;
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isChatView ? 90 : 260 }}
            transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
            className="fixed left-0 top-0 h-screen hidden md:flex flex-col bg-gradient-to-b from-surface-sidebar via-surface-800 to-surface-850 border-r border-line z-sidebar shadow-rail overflow-hidden"
        >
            {/* LOGO (Fixed vertical position) */}
            <div className="flex items-center px-10 h-[120px] shrink-0">
                <Link
                    to="/home"
                    aria-label="CliQ home"
                    className={`flex items-center gap-4 group rounded-[16px] ${isChatView ? "w-full justify-center" : ""}`}
                >
                    <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-brand to-brand-pink flex items-center justify-center shadow-glow group-hover:scale-105 cliq-transition shrink-0">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                            <defs>
                                <filter id="neon-glow-sidebar" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <rect
                                x="4"
                                y="4"
                                width="92"
                                height="92"
                                rx="26"
                                stroke="white"
                                strokeOpacity="0.2"
                                strokeWidth="2.5"
                            />
                            <g filter="url(#neon-glow-sidebar)">
                                <path
                                    d="M 68 36 C 54 26, 38 34, 38 50 C 38 66, 54 74, 68 64"
                                    stroke="white"
                                    strokeWidth="5.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    opacity="0.95"
                                />
                                <path
                                    d="M 68 36 C 46 36, 46 64, 68 64"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                    opacity="0.65"
                                />
                                <path
                                    d="M 38 50 C 44 44, 62 44, 68 36"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    opacity="0.5"
                                />
                                <path
                                    d="M 38 50 C 44 56, 62 56, 68 64"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    opacity="0.5"
                                />
                                <path
                                    d="M 68 28 C 44 14, 26 32, 26 50 C 26 68, 44 86, 68 72"
                                    stroke="white"
                                    strokeWidth="3.5"
                                    strokeDasharray="1 6"
                                    strokeLinecap="round"
                                    fill="none"
                                    opacity="0.8"
                                />
                                <circle cx="68" cy="36" r="7.5" fill="white" />
                                <circle cx="38" cy="50" r="7" fill="white" />
                                <circle cx="68" cy="64" r="7.5" fill="white" />
                            </g>
                        </svg>
                    </div>
                    <AnimatePresence mode="wait">
                        {!isChatView && (
                            <motion.h1
                                key="logo-text"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={labelTransition}
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
                    <NavItem
                        to="/search"
                        icon={Search}
                        label="Search"
                        active={isActive("/search")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/find/getconnection"
                        icon={Compass}
                        label="Explore"
                        active={isActive("/find/getconnection")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/requests"
                        icon={Users}
                        label="Requests"
                        badge={pendingRequestsCount > 0 ? pendingRequestsCount.toString() : null}
                        active={isActive("/requests")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/messages"
                        icon={MessageSquare}
                        label="Messages"
                        active={isActive("/messages")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/notifications"
                        icon={Bell}
                        label="Notifications"
                        badge={unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount.toString()) : null}
                        active={isActive("/notifications")}
                        isChatView={isChatView}
                    />
                </Section>

                <Section title="Create" isChatView={isChatView}>
                    <NavItem
                        to="/create/post"
                        icon={PlusSquare}
                        label="New Post"
                        active={isActive("/create/post")}
                        isChatView={isChatView}
                    />
                </Section>

                <Section title="You" isChatView={isChatView}>
                    <NavItem
                        to="/profile"
                        icon={User}
                        label="Profile"
                        active={isActive("/profile")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/saved"
                        icon={Bookmark}
                        label="Saved"
                        active={isActive("/saved")}
                        isChatView={isChatView}
                    />
                    <NavItem
                        to="/settings"
                        icon={Settings}
                        label="Settings"
                        active={isActive("/settings")}
                        isChatView={isChatView}
                    />
                </Section>
            </div>

            {/* USER CARD (Fixed height to prevent jump) */}
            {user && (
                <div className="mt-auto p-4 shrink-0 h-[88px] flex items-center justify-center">
                    <div
                        className={`rounded-[20px] bg-surface-800 border border-line-soft flex items-center group hover:bg-white/[0.03] hover:border-line shadow-soft overflow-hidden h-14 cliq-transition
                        ${isChatView ? "w-14 justify-center" : "p-3 gap-3 w-full"}`}
                    >
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-brand to-brand-pink p-[2px] shadow-soft shrink-0">
                            <div className="w-full h-full rounded-[12px] bg-surface-900 flex items-center justify-center text-ink-100 font-black text-xs">
                                {user.firstname?.substring(0, 1).toUpperCase() || "A"}
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                            {!isChatView && (
                                <motion.div
                                    key="user-info-box"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={labelTransition}
                                    className="flex flex-col min-w-0 flex-1 whitespace-nowrap overflow-hidden"
                                >
                                    <span className="text-[13px] font-black text-ink-100 truncate leading-none">
                                        {user.firstname} {user.lastname}
                                    </span>
                                    <span className="text-[10px] text-ink-350 font-bold truncate tracking-tight uppercase mt-1">
                                        @{user.firstname?.toLowerCase()}_{user.lastname?.toLowerCase()}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!isChatView && (
                            <MoreHorizontal
                                size={16}
                                className="text-ink-400 group-hover:text-ink-100 cliq-transition"
                            />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
