import { useState, useEffect } from "react";
import { Mail, Lock, X, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const { setUser, setBlockedAccount, setBlockedMessage, setBlockedEmail } = useUserContext();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleChange = (e) => {
        setError(null);
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post("/login", formData);
            
            // Set user in context
            setUser(response.data.user);
            setBlockedAccount(false);
            
            // Close modal
            onClose();
            
            // Refresh page to reset all states and re-fetch connection/feed data
            window.location.reload();
        } catch (err) {
            if (err.response?.status === 403) {
                const blockedMsg = err.response?.data?.message || "This account has been blocked.";
                setBlockedAccount(true);
                setBlockedMessage(blockedMsg);
                setBlockedEmail(formData.email);
                onClose();
                navigate("/blocked-account", { replace: true });
                return;
            }
            const apiError = err.response?.data?.message || "Invalid credentials. Please try again.";
            setError(apiError);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#0f0f0f] rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-2xl font-bold text-black dark:text-white">Switch Account</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 relative z-10">
                        Enter credentials for another account to switch sessions.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                <Mail className="text-gray-400 mr-3" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-transparent outline-none text-black dark:text-white w-full text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                            <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all group">
                                <Lock className="text-gray-400 mr-3 group-focus-within:text-blue-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="bg-transparent outline-none text-black dark:text-white w-full text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors ml-2"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-200 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Switching...
                                </>
                            ) : (
                                "Login & Switch"
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
