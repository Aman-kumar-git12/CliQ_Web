import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Settings, Sun, Moon, LogOut, ArrowLeft } from "lucide-react";
import axios from "../api/axiosClient";
import LogoutConfirmation from "../components/Confirmation";

export default function MobileTopBar({ dark, setDark }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const HandleLogout = async () => {
        try {
            const res = await axios.post(
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
            <div className="fixed top-0 left-0 w-full h-16 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 z-50 md:hidden transition-colors duration-300">

                {/* CONDITIONAL HEADER FOR POST VIEW */}
                {location.pathname.startsWith("/post/") ? (
                    <>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-black dark:text-white"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <span className="text-lg font-bold text-black dark:text-white absolute left-14">
                            Post
                        </span>
                    </>
                ) : (
                    /* DEFAULT HEADER */
                    <>
                        {/* Left: Branding */}
                        <Link to="/home">
                            <h1 className="text-2xl font-extrabold tracking-tighter text-black dark:text-white">
                                CliQ
                            </h1>
                        </Link>

                        {/* Center: For You */}
                        <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-black dark:text-white">
                            For you
                        </span>

                        {/* Right: Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-black dark:text-white"
                            >
                                <Menu size={24} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute top-12 right-0 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right z-[60]">
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm font-medium text-black dark:text-white"
                                    >
                                        <Settings size={18} />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={() => setDark(!dark)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm font-medium text-black dark:text-white w-full text-left"
                                    >
                                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                                        Switch Appearance
                                    </button>

                                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>

                                    <button
                                        onClick={() => setShowLogoutPopup(true)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition text-sm font-medium"
                                    >
                                        <LogOut size={18} />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
