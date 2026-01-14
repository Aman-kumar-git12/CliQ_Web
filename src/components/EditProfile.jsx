import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";

import EditProfileShimmering from "./shimmering/EditProfileShimmering";

export default function EditProfile() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: "",
        imageUrl: "",
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Fetch existing profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", { withCredentials: true });
                const user = res.data.user;

                setForm({
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    password: "",
                    age: user.age,
                    imageUrl: user.imageUrl || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Submit & send to backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const handleConfirmSave = async () => {
        // e.preventDefault(); (Not needed here as it's not an event handler for form submit anymore)
        console.log(form);

        try {
            const res = await axiosClient.put("/profile/edit", form, {
                withCredentials: true,
            });

            console.log("Updated:", res.data);

            navigate("/profile");
        } catch (error) {
            console.error("Update failed:", error);
            const apiError = error.response?.data?.error;
            const errorMessage = typeof apiError === 'string'
                ? apiError
                : apiError?.message || "Something went wrong. Try again.";
            setErrorMsg(errorMessage);
        }
    };

    if (loading)
        return <EditProfileShimmering />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white relative overflow-hidden flex items-center justify-center p-4 transition-colors duration-300">
            {/* Background Gradients (Subtle Dark Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">

                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-10">

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">
                                Edit Profile
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your personal details</p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={form.firstname}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={form.lastname}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password (Optional)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image URL</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-black dark:text-white placeholder-gray-400"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <LogoutConfirmation
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={handleConfirmSave}
                title="Save Changes?"
                message="Are you sure you want to update your profile details?"
                confirmText="Yes, Update"
                confirmColor="bg-blue-600 hover:bg-blue-700"
            />
        </div>
    );
}
