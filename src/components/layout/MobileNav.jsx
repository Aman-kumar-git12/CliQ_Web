import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, PlusSquare, User, Users } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const MobileNav = () => {
    const location = useLocation();
    // Shared with the sidebar through NotificationContext (one request for both, not one per nav)
    const { pendingRequestsCount: pendingCount } = useNotifications();
    const activePath = location.pathname;

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
        <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-nav md:hidden pointer-events-none">
            {/* Gradient Blur Dock: Custom masked blur for a professional app-like feel */}
            <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-950 via-surface-950/80 to-transparent pointer-events-none backdrop-blur-xl"
                style={{
                    WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                }}
            />

            {/* Bottom padding grows on phones with a home indicator */}
            <div className="relative w-full max-w-lg mx-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 px-4 pointer-events-auto">
                <div className="flex items-center justify-around bg-surface-850/95 backdrop-blur-3xl border border-line rounded-[28px] p-1.5 shadow-soft-lg relative overflow-hidden">
                    {/* Background accent glow: Subtler since we are more opaque */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-brand-pink/10 pointer-events-none" />

                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-label={
                                    item.path === "/requests" && pendingCount > 0
                                        ? `${item.label} (${pendingCount} pending)`
                                        : item.label
                                }
                                aria-current={active ? "page" : undefined}
                                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl cliq-press"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-white/[0.06] border border-line-soft rounded-2xl"
                                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                                    />
                                )}

                                <div
                                    className={`relative z-10 flex flex-col items-center gap-1 cliq-transition ${active ? "text-white" : "text-ink-300"}`}
                                >
                                    <div className="relative">
                                        {/* Same box size active or not, so the row doesn't shift when the tab changes */}
                                        <Icon
                                            size={21}
                                            aria-hidden="true"
                                            className={`cliq-transition ${active ? "text-brand-light drop-shadow-glow" : ""}`}
                                            strokeWidth={active ? 2.5 : 2}
                                        />
                                        {item.path === "/requests" && pendingCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 bg-gradient-to-r from-brand to-brand-pink text-white text-[9px] font-black leading-none tabular-nums rounded-full flex items-center justify-center border-2 border-surface-850 shadow-glow-pink">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        aria-hidden="true"
                                        className={`text-[9px] font-black uppercase tracking-widest cliq-transition duration-200 ${active ? "opacity-100" : "opacity-0 scale-75"}`}
                                    >
                                        {item.label}
                                    </span>
                                </div>

                                {active && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-brand to-brand-pink rounded-full shadow-glow-pink"
                                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default MobileNav;
