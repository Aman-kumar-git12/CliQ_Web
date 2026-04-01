import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Confirmation from "./Confirmation";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="min-h-screen bg-transparent relative overflow-x-hidden pt-24 md:pt-12 pb-24 md:pb-20 transition-all duration-500 no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
 
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-3 md:px-0 max-w-full md:max-w-3xl mx-auto w-full relative z-10"
            >
                {/* CLIQ PREMIUM HEADER - Ultra Compact Sync */}
                <div className="flex flex-col items-start justify-start mb-8 md:mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="fill-[#8b5cf6]/20 text-[#8b5cf6]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Profile Module</span>
                    </div>
                    <h1 className="text-[22px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                        Edit
                    </h1>
                    <span className="text-[14px] md:text-[26px] text-[#8b85b1] font-light uppercase italic leading-none -mt-1 block">
                        Information
                    </span>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[32px] overflow-hidden p-5 md:p-10 relative">

                    {errorMsg && (
                        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={form.firstname}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 md:px-5 md:py-[17px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold text-[13px] md:text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={form.lastname}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 md:px-5 md:py-[17px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold text-[13px] md:text-base"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={form.age}
                                    onChange={handleChange}
                                    placeholder="Age"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 md:px-5 md:py-[17px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold text-[13px] md:text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Password (Optional)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 md:px-5 md:py-[17px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold text-[13px] md:text-base"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Profile Image URL</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className="pt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-indigo-500 text-black font-black py-[19px] md:py-[25px] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase italic tracking-widest text-[11px] md:text-sm"
                            >
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </div>

                <Confirmation
                    isOpen={showSaveConfirm}
                    onClose={() => setShowSaveConfirm(false)}
                    onConfirm={handleConfirmSave}
                    title="Save Changes?"
                    message="Are you sure you want to update your profile details?"
                    confirmText="Yes, Update"
                    confirmColor="bg-blue-600 hover:bg-blue-700"
                />
            </motion.div>
        </div>
    );
}
