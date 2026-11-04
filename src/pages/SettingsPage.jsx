import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Trash2, UserCog, Briefcase, LogOut, Download } from "lucide-react";
import * as usersApi from "../api/users";
import ConfirmDialog from "../components/common/ConfirmDialog";
import SettingsShimmering from "../components/shimmering/SettingsShimmering";
import { useUserContext } from "../context/UserContext";
import { showErrorToast } from "../utils/toast";

export default function SettingsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { logout, setUser: setGlobalUser } = useUserContext();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController(); // dropped if the page is left before it loads
        const fetchProfile = async () => {
            try {
                const data = await usersApi.getMyProfile({ signal: controller.signal });
                setUser(data.user);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Error fetching profile:", error);
            }
            setInitialLoading(false);
        };
        fetchProfile();
        return () => controller.abort();
    }, []);

    const handleDeleteProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await usersApi.deleteAccount({ silent: true });
            setGlobalUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Delete failed:", error);
            showErrorToast(error.response?.data?.message || "Failed to delete profile. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const [exporting, setExporting] = useState(false);

    // Saves the account's data as a JSON file (data portability)
    const handleExportData = async () => {
        setExporting(true);
        try {
            const data = await usersApi.exportMyData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `cliq-data-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
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
            className={`w-full flex items-center justify-between px-5 py-4 transition-colors duration-150 ease-soft group text-left focus-visible:outline-none focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40
                ${!noBorder ? "border-b border-white/5" : ""}
                ${danger ? "hover:bg-red-500/[0.06] active:bg-red-500/10" : "hover:bg-white/[0.04] active:bg-white/[0.07]"}`}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-150 ease-soft group-hover:scale-105 ${iconBg}`}
                >
                    <span className={iconColor}>{icon}</span>
                </div>
                <div>
                    <h3
                        className={`text-[15px] font-black tracking-tight transition-colors duration-150 ease-soft ${danger ? "text-red-400 group-hover:text-red-300" : "text-white"}`}
                    >
                        {title}
                    </h3>
                    <p className="text-[12px] text-ink-300 font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            {rightEl || (
                <ChevronRight
                    size={18}
                    className={`cliq-transition group-hover:translate-x-0.5 ${danger ? "text-red-400/50" : "text-white/20 group-hover:text-white/50"}`}
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
                <p className="text-ink-300 text-[13px] font-bold tracking-wide mt-1">Manage your CLIQ account</p>
            </div>

            {/* Profile Preview */}
            {user && (
                <div className="mb-8 px-5 py-4 bg-white/[0.03] backdrop-blur-2xl border border-line rounded-[24px] flex items-center gap-4 shadow-soft-lg">
                    <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-brand to-brand-pink p-[2px] flex-shrink-0">
                        <div className="w-full h-full rounded-[16px] bg-surface-900 overflow-hidden flex items-center justify-center">
                            {user.imageUrl ? (
                                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-ink-300">{(user.firstname || "U")[0]}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-[16px] font-black text-white tracking-tight">
                            {user.firstname} {user.lastname}
                        </p>
                        <p className="text-[12px] text-ink-300 font-bold">{user.email}</p>
                    </div>
                    <div className="ml-auto">
                        <div className="px-3 py-1.5 rounded-full bg-surface-600 border border-brand/20 text-[10px] font-black text-brand-light uppercase tracking-widest">
                            CLIQ
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-3">
                <p className="text-[10px] font-black text-ink-300 uppercase tracking-[0.2em] px-1 mb-3">Account</p>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-line rounded-[24px] overflow-hidden shadow-soft-lg">
                    <SettingRow
                        onClick={() => navigate("/edit-profile")}
                        icon={<UserCog size={20} strokeWidth={2.5} />}
                        iconBg="bg-brand/15"
                        iconColor="text-brand-light"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                    />
                    <Link to="/my-experties" className="block focus-visible:outline-none" tabIndex={-1}>
                        <SettingRow
                            onClick={() => {}}
                            icon={<Briefcase size={20} strokeWidth={2.5} />}
                            iconBg="bg-blue-500/15"
                            iconColor="text-blue-400"
                            title="Edit Expertise"
                            subtitle="Manage your professional skills & templates"
                        />
                    </Link>
                    <SettingRow
                        onClick={handleExportData}
                        icon={<Download size={20} strokeWidth={2.5} />}
                        iconBg="bg-emerald-500/15"
                        iconColor="text-emerald-400"
                        title={exporting ? "Preparing Download..." : "Download My Data"}
                        rightEl={
                            exporting ? (
                                <span
                                    aria-hidden="true"
                                    className="w-4 h-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin"
                                />
                            ) : undefined
                        }
                        subtitle="Your profile, posts, comments, messages and more as a JSON file"
                        noBorder
                    />
                </div>
            </div>

            <div className="mb-3 mt-8">
                <p className="text-[10px] font-black text-ink-300 uppercase tracking-[0.2em] px-1 mb-3">Danger Zone</p>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-line rounded-[24px] overflow-hidden shadow-soft-lg">
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
                <div className="mt-2 flex gap-4 text-[11px] text-ink-300">
                    <Link
                        to="/privacy"
                        className="rounded hover:text-white/60 transition-colors duration-150 ease-soft focus-ring"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to="/terms"
                        className="rounded hover:text-white/60 transition-colors duration-150 ease-soft focus-ring"
                    >
                        Terms
                    </Link>
                </div>
            </div>

            {/* Logout Confirmation */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Log Out?"
                confirmText={logoutLoading ? "Logging out..." : "Yes, Log Out"}
                confirmColor="bg-orange-600 hover:bg-orange-700"
                isLoading={logoutLoading}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteProfile}
                title="Delete Profile?"
                confirmText={loading ? "Deleting..." : "Yes, Delete"}
                confirmColor="bg-red-600 hover:bg-red-700"
                isLoading={loading}
            />
        </div>
    );
}
