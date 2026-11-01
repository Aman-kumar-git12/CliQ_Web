import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

// Compact bell used in the mobile top bar; the desktop sidebar uses a NavItem badge.
export default function NotificationBell({ className = "" }) {
    const { unreadCount } = useNotifications();
    const label = unreadCount > 99 ? "99+" : String(unreadCount);

    return (
        <Link
            to="/notifications"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-purple-100/80 hover:text-white group shadow-[0_0_15px_rgba(168,85,247,0.1)] ${className}`}
        >
            <Bell size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-pink text-white text-[10px] font-black border-2 border-black shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                    {label}
                </span>
            )}
        </Link>
    );
}
