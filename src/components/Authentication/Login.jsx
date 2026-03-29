import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        newPassword: "",
    });
    const navigate = useNavigate();
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setUser, setBlockedAccount, setBlockedMessage, setBlockedEmail } = useUserContext();
    const [searchParams, setSearchParams] = useSearchParams();

    const [error, setError] = useState(null);
    const [showErr, setShowErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    useEffect(() => {
        const authError = searchParams.get("authError");
        if (authError) {
            setError(authError);
            setShowErr(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleChange = (e) => {
        setShowErr(false); // hide error while typing
        setResendMessage("");
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleResendVerification = async () => {
        if (!formData.email) {
            setError("Enter your email first to resend the verification link.");
            setShowErr(true);
            return;
        }

        setResendLoading(true);
        try {
            const response = await axiosClient.post("/auth/resend-verification", {
                email: formData.email,
            });
            setResendMessage(response.data?.message || "Verification email sent.");
            setShowErr(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Unable to resend verification email.";
            setError(errorMessage);
            setShowErr(true);
            setResendMessage("");
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResendMessage("");
        setError(null);
        setShowErr(false);

        if (forgotPasswordMode) {
            if (formData.newPassword.length < 8) {
                setError("New password must be at least 8 characters long.");
                setShowErr(true);
                setLoading(false);
                return;
            }

            try {
                // Trigger the forgot password email
                await axiosClient.post("/auth/forgot-password", { email: formData.email });
                
                // Immediately navigate to OTP verification, passing the new password silently in state
                navigate("/verify-otp", {
                    replace: true,
                    state: { 
                        email: formData.email, 
                        intent: "reset_password",
                        newPassword: formData.newPassword
                    }
                });
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to send reset code. Try again.";
                setError(errorMessage);
                setShowErr(true);
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const response = await axiosClient.post("/login", formData);
            // console.log("Login response:", response.data);
            setUser(response.data.user);
            setBlockedAccount(false);
            navigate("/home");
            setShowErr(false);
            setError(null);
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.code !== "EMAIL_NOT_VERIFIED") {
                const blockedMsg = err.response?.data?.message || "This account has been blocked.";
                setBlockedAccount(true);
                setBlockedMessage(blockedMsg);
                setBlockedEmail(formData.email);
                navigate("/blocked-account", { replace: true });
                return;
            }
            // show backend error message
            const errorData = err.response?.data;
            const errorMessage = errorData?.message || errorData?.error || "Something went wrong";
            setError(errorMessage);
            setShowErr(true);
            // console.log("Login error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-semibold">Welcome back</h1>
                <h2 className="italic text-4xl sm:text-5xl text-gray-200">
                    to great bread
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
                {/* Top Heading */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold">
                        {forgotPasswordMode ? "Reset Password" : "Login Now!"}
                    </h3>

                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-300">New here?</span>
                        <Link to="/" className="underline hover:text-gray-200 transition">
                            Signup
                        </Link>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center border border-gray-600 rounded px-3 py-2 group focus-within:border-white transition-colors">
                    <Mail className="text-gray-400 mr-2 group-focus-within:text-white transition-colors" size={18} />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-transparent outline-none text-gray-200 w-full"
                    />
                </div>

                {/* Password / New Password */}
                <div>
                    <div className="flex items-center border border-gray-600 rounded px-3 py-2 group focus-within:border-white transition-colors">
                        <Lock className="text-gray-400 mr-2 group-focus-within:text-white transition-colors" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name={forgotPasswordMode ? "newPassword" : "password"}
                            placeholder={forgotPasswordMode ? "Enter new password" : "Enter password"}
                            value={forgotPasswordMode ? formData.newPassword : formData.password}
                            onChange={handleChange}
                            className="bg-transparent outline-none text-gray-200 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Toggle Forgot Password Mode */}
                    <div className="flex justify-end mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setForgotPasswordMode(!forgotPasswordMode);
                                setError(null);
                                setShowErr(false);
                            }}
                            className="text-xs text-neutral-400 hover:text-white transition cursor-pointer"
                        >
                            {forgotPasswordMode ? "Back to Login" : "Forgot Password?"}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {showErr && (
                    <div className="text-red-600 px-4 py-2 rounded">{error}</div>
                )}

                {resendMessage && (
                    <div className="text-green-500 px-4 py-2 rounded">{resendMessage}</div>
                )}

                {showErr && error === "Please verify your email before logging in." && (
                    <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className={`w-full border border-white/20 text-white font-medium py-3 rounded-full hover:bg-white/5 transition-all ${resendLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {resendLoading ? "Sending..." : "Resend verification email"}
                    </button>
                )}

                {/* Submit Button */}
                <button
                    disabled={loading}
                    type="submit"
                    className={`w-full bg-white text-black font-semibold py-3 rounded-full hover:opacity-90 transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {loading ? (forgotPasswordMode ? "Sending..." : "Logging in...") : (forgotPasswordMode ? "Send OTP" : "Login")}
                </button>

                <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <GoogleAuthButton label="signin_with" />
            </form>
        </div>
    );
}
