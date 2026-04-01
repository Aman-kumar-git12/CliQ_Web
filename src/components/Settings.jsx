import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Trash2, UserCog, Briefcase, LogOut, Shield, Bell, Lock } from "lucide-react";
import axiosClient from "../api/axiosClient";
import Confirmation from "./Confirmation";
import SettingsShimmering from "./shimmering/SettingsShimmering";

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", { withCredentials: true });
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleDeleteProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await axiosClient.delete(`/profile/delete`, { withCredentials: true });
            navigate("/login");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete profile. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };


    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await axiosClient.post("/logout", {}, { withCredentials: true });
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Navigate anyway on error
            navigate("/login");
        } finally {
            setLogoutLoading(false);
            setShowLogoutConfirm(false);
        }
    };

    useEffect(() => {
        const isModalOpen = showDeleteConfirm || showLogoutConfirm;
        const rootElement = document.getElementById("root");
        if (rootElement) {
            if (isModalOpen) {
                rootElement.classList.add("global-modal-blur");
            } else {
                rootElement.classList.remove("global-modal-blur");
            }
        }
        return () => {
            if (rootElement) rootElement.classList.remove("global-modal-blur");
        };
    }, [showDeleteConfirm, showLogoutConfirm]);

    const SettingRow = ({ icon, iconBg, iconColor, title, subtitle, onClick, danger, rightEl, noBorder }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-300 group active:scale-[0.98] text-left
                ${!noBorder ? "border-b border-white/5" : ""}
                ${danger ? "hover:bg-red-500/5" : "hover:bg-white/5"}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <span className={iconColor}>{icon}</span>
                </div>
                <div>
                    <h3 className={`text-[15px] font-black tracking-tight ${danger ? "text-red-400 group-hover:text-red-300" : "text-white"}`}>
                        {title}
                    </h3>
                    <p className="text-[12px] text-white/40 font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            {rightEl || (
                <ChevronRight
                    size={18}
                    className={`transition-all duration-300 group-hover:translate-x-0.5 ${danger ? "text-red-400/50" : "text-white/20 group-hover:text-white/50"}`}
                />
            )}
        </button>
    );

    if (initialLoading) return <SettingsShimmering />;

    return (
        <div className="w-full min-h-screen bg-transparent text-white pt-10 px-5 pb-24 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-[32px] font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-md">
                    SETTINGS
                </h1>
                <p className="text-white/30 text-[13px] font-bold tracking-wide mt-1">Manage your CLIQ account</p>
            </div>

            {/* Profile Preview */}
            {user && (
                <div className="mb-8 px-5 py-4 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] flex items-center gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-[16px] bg-black overflow-hidden flex items-center justify-center">
                            {user.imageUrl
                                ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                                : <span className="text-2xl font-black text-white/40">{(user.firstname || "U")[0]}</span>
                            }
                        </div>
                    </div>
                    <div>
                        <p className="text-[16px] font-black text-white tracking-tight">{user.firstname} {user.lastname}</p>
                        <p className="text-[12px] text-white/40 font-bold">{user.email}</p>
                    </div>
                    <div className="ml-auto">
                        <div className="px-3 py-1.5 rounded-full bg-[#1A1A24] border border-violet-500/20 text-[10px] font-black text-violet-400 uppercase tracking-widest">
                            CLIQ
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-3">
                <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em] px-1 mb-3">Account</p>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    <SettingRow
                        onClick={() => navigate("/edit-profile")}
                        icon={<UserCog size={20} strokeWidth={2.5} />}
                        iconBg="bg-violet-500/15"
                        iconColor="text-violet-400"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                    />
                    <Link to="/my-experties" className="block">
                        <SettingRow
                            onClick={() => { }}
                            icon={<Briefcase size={20} strokeWidth={2.5} />}
                            iconBg="bg-blue-500/15"
                            iconColor="text-blue-400"
                            title="Edit Expertise"
                            subtitle="Manage your professional skills & templates"
                            noBorder
                        />
                    </Link>
                </div>
            </div>

            <div className="mb-3 mt-8">
                <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em] px-1 mb-3">Danger Zone</p>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    <SettingRow
                        onClick={() => setShowLogoutConfirm(true)}
                        icon={<LogOut size={20} strokeWidth={2.5} />}
                        iconBg="bg-orange-500/15"
                        iconColor="text-orange-400"
                        title="Log Out"
                        subtitle="Sign out of your CLIQ account"
                    />
                    <SettingRow
                        onClick={() => setShowDeleteConfirm(true)}
                        icon={<Trash2 size={20} strokeWidth={2.5} />}
                        iconBg="bg-red-500/15"
                        iconColor="text-red-400"
                        title="Delete Profile"
                        subtitle="Permanently remove your account"
                        danger
                        noBorder
                    />
                </div>
            </div>

            {/* App Version */}
            <div className="mt-12 flex flex-col items-center gap-1">
                <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">CLIQ v1.0</div>
                <div className="text-[10px] text-white/10">Made with ♥ for connection</div>
            </div>


            {/* Logout Confirmation */}
            <Confirmation
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Log Out?"
                confirmText={logoutLoading ? "Logging out..." : "Yes, Log Out"}
                confirmColor="bg-orange-600 hover:bg-orange-700"
            />

            {/* Delete Confirmation */}
            <Confirmation
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteProfile}
                title="Delete Profile?"
                confirmText={loading ? "Deleting..." : "Yes, Delete"}
                confirmColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
}
