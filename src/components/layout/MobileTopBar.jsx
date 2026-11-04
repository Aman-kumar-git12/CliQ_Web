import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Settings, MessageSquare, LogOut, ArrowLeft, Search, Bookmark } from "lucide-react";
import ConfirmDialog from "../common/ConfirmDialog";
import NotificationBell from "../notifications/NotificationBell";
import { useUserContext } from "../../context/UserContext";

// Shared looks: square icon buttons on the bar, and rows in the dropdown menu
const ACTION_BUTTON =
    "w-10 h-10 flex items-center justify-center rounded-xl bg-brand/10 border border-brand/20 hover:bg-brand/20 hover:border-brand/35 text-ink-100/85 hover:text-white group cliq-press";
const MENU_ITEM =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand/10 text-[13px] font-bold text-ink-200 hover:text-white group cliq-transition";
const MENU_ICON =
    "w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 cliq-transition";

export default function MobileTopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const navigate = useNavigate();
    const { logout } = useUserContext();
    const location = useLocation();

    const HandleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            {/* Overlay for menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} aria-hidden="true"></div>
            )}

            {/* Logout Confirmation */}
            <ConfirmDialog
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={HandleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />

            {/* Top Bar */}
            <div className="fixed top-0 left-0 w-full h-[70px] bg-gradient-to-b from-surface-night to-surface-950/95 backdrop-blur-xl border-b border-brand/15 flex items-center justify-between px-6 z-nav md:hidden shadow-soft-lg">
                {/* CONDITIONAL HEADER FOR POST VIEW */}
                {location.pathname.startsWith("/post/") ? (
                    <>
                        <button
                            type="button"
                            aria-label="Go back"
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-xl hover:bg-brand/10 text-ink-200 hover:text-white cliq-press"
                        >
                            <ArrowLeft size={22} strokeWidth={2.5} />
                        </button>

                        <div className="absolute left-1/2 -translate-x-1/2 text-[15px] font-black uppercase tracking-[0.2em] text-ink-100">
                            Post
                        </div>

                        <div className="w-10"></div>
                    </>
                ) : (
                    <>
                        {/* Left: Branding */}
                        <Link to="/home" className="group rounded-lg">
                            <h1 className="text-[26px] font-black tracking-[-0.05em] text-white flex items-center gap-1 group-hover:scale-[1.03] origin-left cliq-transition italic">
                                CliQ
                                <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-glow mt-3 motion-safe:animate-pulse"></span>
                            </h1>
                        </Link>

                        {/* Center: Context Tab */}
                        <div className="absolute left-1/2 -translate-x-1/2 hidden min-[460px]:flex flex-col items-center">
                            <span className="text-[13px] font-black text-ink-100/90 tracking-tight">For you</span>
                            <div className="w-1 h-1 rounded-full bg-brand/50 mt-1"></div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <Link to="/search" aria-label="Search" className={ACTION_BUTTON}>
                                <Search
                                    size={20}
                                    strokeWidth={2.5}
                                    aria-hidden="true"
                                    className="group-hover:scale-105 cliq-transition"
                                />
                            </Link>

                            <NotificationBell />

                            <Link to="/messages" aria-label="Messages" className={ACTION_BUTTON}>
                                <MessageSquare
                                    size={20}
                                    strokeWidth={2.5}
                                    aria-hidden="true"
                                    className="group-hover:scale-105 cliq-transition"
                                />
                            </Link>

                            <div className="relative">
                                <button
                                    type="button"
                                    aria-label="Open menu"
                                    aria-expanded={isMenuOpen}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={ACTION_BUTTON}
                                >
                                    <Menu
                                        size={20}
                                        strokeWidth={2.5}
                                        aria-hidden="true"
                                        className="group-hover:scale-105 cliq-transition"
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute top-[52px] right-0 w-56 cliq-popover rounded-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[110]">
                                        <Link to="/settings" onClick={() => setIsMenuOpen(false)} className={MENU_ITEM}>
                                            <div className={MENU_ICON}>
                                                <Settings size={16} className="text-brand-light" strokeWidth={2.5} />
                                            </div>
                                            Settings
                                        </Link>

                                        <Link to="/saved" onClick={() => setIsMenuOpen(false)} className={MENU_ITEM}>
                                            <div className={MENU_ICON}>
                                                <Bookmark size={16} className="text-brand-light" strokeWidth={2.5} />
                                            </div>
                                            Saved
                                        </Link>

                                        <div className="h-px bg-line-soft my-1 mx-2"></div>

                                        <button
                                            type="button"
                                            onClick={() => setShowLogoutPopup(true)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-[13px] font-bold text-red-400 hover:text-red-300 group text-left cliq-transition"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 cliq-transition">
                                                <LogOut size={16} strokeWidth={2.5} />
                                            </div>
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
