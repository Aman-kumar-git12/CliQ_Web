import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import * as authApi from "../../api/auth";
import { useUserContext } from "../../context/UserContext";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import {
    authAppear,
    authCardClass,
    authFieldButtonClass,
    authFieldClass,
    authFieldIconClass,
    authInputClass,
    authLinkClass,
    authNoticeClass,
    authPageClass,
    authPrimaryButtonClass,
    authSecondaryButtonClass,
    authSpinnerClass,
} from "../../components/auth/authStyles";

export default function LoginPage() {
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

    // Set when the app was logged out because the session ended (e.g. password changed elsewhere)
    const sessionExpired = useLocation().state?.sessionExpired === true;
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
            const data = await authApi.resendVerification(formData.email, { silent: true });
            setResendMessage(data?.message || "Verification email sent.");
            setShowErr(false);
            // The email contains a code, so go to the page where it can be entered (same as after signup)
            navigate("/verify-otp", { state: { email: formData.email }, replace: true });
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || err.response?.data?.error || "Unable to resend verification email.";
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
                await authApi.forgotPassword(formData.email, { silent: true });

                // Immediately navigate to OTP verification, passing the new password silently in state
                navigate("/verify-otp", {
                    replace: true,
                    state: {
                        email: formData.email,
                        intent: "reset_password",
                        newPassword: formData.newPassword,
                    },
                });
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || err.response?.data?.error || "Failed to send reset code. Try again.";
                setError(errorMessage);
                setShowErr(true);
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const data = await authApi.login(formData, { silent: true });
            setUser(data.user);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className={authPageClass}>
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Welcome back</h1>
                    <h2 className="italic text-4xl sm:text-5xl text-white/70 tracking-tight">to CliQ</h2>
                </div>

                <form onSubmit={handleSubmit} className={`${authCardClass} max-w-sm p-6 sm:p-7 space-y-5`}>
                    {sessionExpired && (
                        <p role="status" className={authNoticeClass.warning}>
                            Your session has ended. Please log in again.
                        </p>
                    )}
                    {/* Top Heading */}
                    <div className="flex justify-between items-center gap-3 mb-1">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.h3
                                key={forgotPasswordMode ? "reset" : "login"}
                                {...authAppear}
                                className="text-2xl font-semibold tracking-tight"
                            >
                                {forgotPasswordMode ? "Reset Password" : "Login Now!"}
                            </motion.h3>
                        </AnimatePresence>

                        <div className="flex items-center gap-1 text-sm shrink-0">
                            <span className="text-ink-300">New here?</span>
                            <Link to="/" className={`text-white/90 ${authLinkClass}`}>
                                Signup
                            </Link>
                        </div>
                    </div>

                    {/* Email */}
                    <div className={authFieldClass()}>
                        <Mail className={authFieldIconClass} size={18} aria-hidden="true" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            aria-label="Email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={authInputClass}
                        />
                    </div>

                    {/* Password / New Password */}
                    <div>
                        <div className={authFieldClass()}>
                            <Lock className={authFieldIconClass} size={18} aria-hidden="true" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name={forgotPasswordMode ? "newPassword" : "password"}
                                placeholder={forgotPasswordMode ? "Enter new password" : "Enter password"}
                                aria-label={forgotPasswordMode ? "New password" : "Password"}
                                autoComplete={forgotPasswordMode ? "new-password" : "current-password"}
                                value={forgotPasswordMode ? formData.newPassword : formData.password}
                                onChange={handleChange}
                                className={authInputClass}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className={authFieldButtonClass}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Toggle Forgot Password Mode */}
                        <div className="flex justify-between items-center gap-3 mt-2">
                            <p className="text-xs text-ink-400">
                                {forgotPasswordMode ? "At least 8 characters. We'll email you a code." : ""}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setForgotPasswordMode(!forgotPasswordMode);
                                    setError(null);
                                    setShowErr(false);
                                }}
                                className="shrink-0 rounded-sm text-xs text-ink-300 hover:text-white transition-colors duration-150 cursor-pointer focus-ring"
                            >
                                {forgotPasswordMode ? "Back to Login" : "Forgot Password?"}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {showErr && (
                        <motion.div {...authAppear} role="alert" className={authNoticeClass.error}>
                            {error}
                        </motion.div>
                    )}

                    {resendMessage && (
                        <motion.div {...authAppear} role="status" className={authNoticeClass.success}>
                            {resendMessage}
                        </motion.div>
                    )}

                    {showErr && error === "Please verify your email before logging in." && (
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className={authSecondaryButtonClass}
                        >
                            {resendLoading && <span className={authSpinnerClass} aria-hidden="true" />}
                            {resendLoading ? "Sending..." : "Resend verification email"}
                        </button>
                    )}

                    {/* Submit Button */}
                    <button disabled={loading} type="submit" className={authPrimaryButtonClass}>
                        {loading && <span className={authSpinnerClass} aria-hidden="true" />}
                        {loading
                            ? forgotPasswordMode
                                ? "Sending..."
                                : "Logging in..."
                            : forgotPasswordMode
                              ? "Send OTP"
                              : "Login"}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs uppercase tracking-[0.25em] text-ink-400">or</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <GoogleAuthButton label="signin_with" />
                </form>
            </div>
        </MotionConfig>
    );
}
