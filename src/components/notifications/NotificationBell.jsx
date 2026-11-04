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
            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-brand/10 border border-brand/20 hover:bg-brand/20 hover:border-brand/35 text-ink-100/85 hover:text-white group cliq-press focus-ring relative ${className}`}
        >
            <Bell size={20} strokeWidth={2.5} aria-hidden="true" className="group-hover:scale-105 cliq-transition" />
            {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-pink text-white text-[10px] font-black border-2 border-surface-850 shadow-glow-pink">
                    {label}
                </span>
            )}
        </Link>
    );
}
