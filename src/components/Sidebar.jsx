import {
    Home,
    Search,
    PlusSquare,
    Heart,
    User,
    Menu,
    Sun,
    Moon,
    LogOut,
    Settings,
    MessageSquare
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useUserContext } from "../context/userContext";

import LogoutConfirmation from "./Confirmation";

export default function Sidebar({ dark, setDark }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const { setUser } = useUserContext();

    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const HandleLogout = async () => {
        try {
            await axiosClient.post(
                "/logout",
                {},
                { withCredentials: true }
            );
        } catch (err) {
            console.log(err);
        } finally {
            setUser(null);
            navigate("/login");
        }
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            className={`p-3 rounded-xl transition-all duration-300 group relative flex items-center justify-center
                ${isActive(to)
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105"
                    : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                }`}
        >
            <Icon size={26} strokeWidth={isActive(to) ? 2.5 : 2} />

            <span className="absolute left-20 bg-black dark:bg-white text-white dark:text-black text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                {label}
            </span>
        </Link>
    );

    return (
        <>
            {/* Outside overlay for menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* 🔥 Logout Confirmation Popup */}
            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={HandleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />

            <div className="w-28 fixed left-0 top-0 h-screen border-r border-neutral-200 dark:border-neutral-800 hidden md:flex flex-col items-center py-8 justify-between bg-white/90 dark:bg-black/90 backdrop-blur-xl z-50 transition-colors duration-300">
                <div className="flex flex-col gap-8 items-center w-full">
                    <Link
                        to="/home"
                        className="mb-4 hover:scale-110 transition-transform duration-300"
                    >
                        <h1 className="text-3xl font-extrabold tracking-tighter text-black dark:text-white">
                            CliQ
                        </h1>
                    </Link>

                    <div className="flex flex-col gap-4">
                        <NavItem to="/home" icon={Home} label="Home" />
                        <NavItem to="/find/findpeople" icon={Search} label="Find" />
                        <NavItem to="/requests" icon={Heart} label="Requests" />
                        <NavItem to="/create/post" icon={PlusSquare} label="Create" />
                        <NavItem to="/my-connections" icon={MessageSquare} label="Messages" />
                        <NavItem to="/profile" icon={User} label="Profile" />
                    </div>
                </div>

                <div className="flex flex-col gap-6 items-center relative">
                    {/* Dropdown menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-16 left-4 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4 duration-200 origin-bottom-left z-[60]">
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

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-3 rounded-xl transition-all duration-300 z-[70] group relative ${isMenuOpen
                            ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
                            : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                            }`}
                    >
                        <Menu size={26} />
                        <span className="absolute left-20 bg-black dark:bg-white text-white dark:text-black text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                            Menu
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
