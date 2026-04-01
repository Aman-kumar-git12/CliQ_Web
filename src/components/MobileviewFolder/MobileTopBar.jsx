import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Settings, MessageSquare, LogOut, ArrowLeft } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import LogoutConfirmation from "../Confirmation";

export default function MobileTopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const HandleLogout = async () => {
        try {
            const res = await axiosClient.post(
                "/logout",
                {},
                { withCredentials: true }
            );

            if (res.status === 200) {
                navigate("/login");
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {/* Overlay for menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Logout Confirmation */}
            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={HandleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />

            {/* Top Bar */}
            <div className="fixed top-0 left-0 w-full h-[70px] bg-gradient-to-b from-[#0f041e] to-black/95 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-6 z-[100] md:hidden transition-all duration-500 shadow-[0_10px_40px_rgba(88,28,135,0.3)]">
                {/* CONDITIONAL HEADER FOR POST VIEW */}
                {location.pathname.startsWith("/post/") ? (
                    <>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-xl hover:bg-purple-500/10 transition-all text-purple-200 hover:text-white"
                        >
                            <ArrowLeft size={22} strokeWidth={2.5} />
                        </button>

                        <div className="absolute left-1/2 -translate-x-1/2 text-[15px] font-black uppercase tracking-[0.2em] text-purple-100">
                            Post
                        </div>

                        <div className="w-10"></div>
                    </>
                ) : (
                    <>
                        {/* Left: Branding */}
                        <Link to="/home" className="group">
                            <h1 className="text-[26px] font-black tracking-[-0.05em] text-white flex items-center gap-1 group-hover:scale-105 transition-transform duration-300 italic">
                                CliQ
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,1)] mt-3 animate-pulse"></div>
                            </h1>
                        </Link>

                        {/* Center: Context Tab */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-[13px] font-black text-purple-100/90 tracking-tight">
                                For you
                            </span>
                            <div className="w-1 h-1 rounded-full bg-purple-500/40 mt-1"></div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                to="/messages"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-purple-100/80 hover:text-white group shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                            >
                                <MessageSquare size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-purple-100/80 hover:text-white group shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                >
                                    <Menu size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute top-[52px] right-0 w-56 bg-[#0a0510] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-purple-500/20 p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[110] backdrop-blur-3xl">
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/10 transition-all text-[13px] font-bold text-purple-100/70 hover:text-white group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                                <Settings size={16} className="text-purple-400" strokeWidth={2.5} />
                                            </div>
                                            Settings
                                        </Link>

                                        <div className="h-px bg-purple-500/10 my-1 mx-2"></div>

                                        <button
                                            onClick={() => setShowLogoutPopup(true)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-[13px] font-bold text-red-400/70 hover:text-red-500 group text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
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
