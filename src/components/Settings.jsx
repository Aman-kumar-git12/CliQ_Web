import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Trash2, UserCog } from "lucide-react";
import axiosClient from "../api/axiosClient";
import Confirmation from "./Confirmation";

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", { withCredentials: true });
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleDeleteProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Using the requested route for deletion
            await axiosClient.delete(`/profile/delete`, { withCredentials: true });

            // Navigate to login on success
            navigate("/login");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete profile. Please try again.");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleEditProfile = () => {
        setShowEditConfirm(false);
        navigate("/edit-profile");
    };

    return (
        <div className="w-full pt-4 px-4 pb-20">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Settings</h1>

            <div className="space-y-4">
                {/* Edit Profile */}
                <button
                    onClick={() => setShowEditConfirm(true)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <UserCog size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-black dark:text-white">Edit Profile</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your personal information</p>
                        </div>
                    </div>
                    <ChevronRight className="text-neutral-400" />
                </button>

                {/* Delete Profile */}
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                            <Trash2 size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition">Delete Profile</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Permanently remove your account</p>
                        </div>
                    </div>
                    <ChevronRight className="text-neutral-400" />
                </button>
            </div>

            {/* Edit Confirmation */}
            <Confirmation
                isOpen={showEditConfirm}
                onClose={() => setShowEditConfirm(false)}
                onConfirm={handleEditProfile}
                title="Edit Profile?"
                confirmText="Yes, Edit"
                confirmColor="bg-blue-600 hover:bg-blue-700"
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
