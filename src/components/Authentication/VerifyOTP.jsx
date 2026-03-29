import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, RefreshCw, ArrowRight, CheckCircle } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECS = 60; // 1 min initial UI cooldown; backend enforces 10 min real cooldown

export default function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useUserContext();

    // Email and optionally intent/newPassword passed via route state
    const email = location.state?.email || "";
    const intent = location.state?.intent || "verify_email";
    const newPassword = location.state?.newPassword || "";

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Resend state
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [cooldown, setCooldown] = useState(0); // seconds remaining

    const inputRefs = useRef([]);
    const timerRef = useRef(null);

    // Redirect to signup if no email in state
    useEffect(() => {
        if (!email) {
            navigate("/", { replace: true });
        }
    }, [email, navigate]);

    // Cooldown ticker
    useEffect(() => {
        if (cooldown <= 0) return;
        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [cooldown]);

    // Auto-focus first box on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleDigitChange = (index, value) => {
        // Only allow a single digit
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);
        setError(null);

        // Auto-advance
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (digit && index === OTP_LENGTH - 1) {
            const allFilled = newDigits.every((d) => d !== "");
            if (allFilled) {
                handleSubmit(newDigits.join(""));
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = "";
                setDigits(newDigits);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = "";
                setDigits(newDigits);
            }
            e.preventDefault();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newDigits = [...digits];
        pasted.split("").forEach((char, i) => {
            if (i < OTP_LENGTH) newDigits[i] = char;
        });
        setDigits(newDigits);
        // Focus the next empty box or last box
        const nextEmpty = newDigits.findIndex((d) => !d);
        const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
        inputRefs.current[focusIdx]?.focus();

        if (newDigits.every((d) => d !== "")) {
            handleSubmit(newDigits.join(""));
        }
    };

    const handleSubmit = async (otpOverride) => {
        const otp = otpOverride ?? digits.join("");
        if (otp.length < OTP_LENGTH) {
            setError("Please enter all 6 digits.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = intent === "reset_password" ? "/auth/reset-password" : "/auth/verify-otp";
            const payload = intent === "reset_password" 
                ? { email, otp, newPassword } 
                : { email, otp };

            const response = await axiosClient.post(
                endpoint,
                payload,
                { withCredentials: true }
            );

            const verifiedUser = response.data?.user || null;
            if (verifiedUser) {
                setUser(verifiedUser);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/home", { replace: true });
            }, 1500);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Verification failed. Please try again.";
            setError(msg);
            // If expired, clear the boxes so user knows to resend
            if (err.response?.data?.code === "OTP_EXPIRED") {
                setDigits(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading) return;
        setResendLoading(true);
        setResendMessage("");
        setError(null);

        try {
            const endpoint = intent === "reset_password" ? "/auth/forgot-password" : "/auth/resend-verification";
            const response = await axiosClient.post(endpoint, { email });
            setResendMessage(response.data?.message || "A new code has been sent to your email.");
            setDigits(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN_SECS);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to resend. Please try again later.";
            setError(msg);

            // If backend returned a remainingMs, use it for the UI cooldown
            const remainingMs = err.response?.data?.remainingMs;
            if (remainingMs > 0) {
                setCooldown(Math.ceil(remainingMs / 1000));
            }
        } finally {
            setResendLoading(false);
        }
    };

    const formatCooldown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">

                    {/* Top accent line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="px-8 py-10">

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Mail size={24} className="text-white/70" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {success ? (intent === "reset_password" ? "Password Reset!" : "Verified!") : (intent === "reset_password" ? "Password Reset" : "Check your email")}
                            </h1>
                        </div>
                        <p className="text-center text-sm text-neutral-400 mb-8 leading-relaxed">
                            {success
                                ? "Redirecting you to your feed…"
                                : <>
                                    We sent a 6-digit code to{" "}
                                    <span className="text-white font-medium">{email}</span>
                                </>
                            }
                        </p>

                        {/* Success state */}
                        {success ? (
                            <div className="flex justify-center">
                                <CheckCircle size={48} className="text-green-400" strokeWidth={1.5} />
                            </div>
                        ) : (
                            <>
                                {/* OTP Digit Boxes */}
                                <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
                                    {digits.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => (inputRefs.current[i] = el)}
                                            id={`otp-digit-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleDigitChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            disabled={loading}
                                            className={`
                                                w-11 h-14 text-center text-xl font-semibold rounded-xl
                                                bg-white/5 border transition-all duration-150 outline-none
                                                ${digit ? "border-white/40 text-white" : "border-white/10 text-neutral-500"}
                                                focus:border-white/60 focus:bg-white/8 focus:ring-0
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                caret-transparent
                                            `}
                                            autoComplete="one-time-code"
                                        />
                                    ))}
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="text-center text-sm text-red-400 mb-4 animate-pulse">
                                        {error}
                                    </p>
                                )}

                                {/* Resend success */}
                                {resendMessage && (
                                    <p className="text-center text-sm text-green-400 mb-4">
                                        {resendMessage}
                                    </p>
                                )}

                                {/* Verify Button */}
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={loading || digits.some((d) => !d)}
                                    className={`
                                        w-full flex items-center justify-center gap-2
                                        bg-white text-black font-semibold py-3 rounded-full
                                        hover:opacity-90 transition-all
                                        ${loading || digits.some((d) => !d) ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Verify <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>

                                {/* Resend section */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-neutral-500 mb-2">Didn't receive the code?</p>
                                    <button
                                        onClick={handleResend}
                                        disabled={cooldown > 0 || resendLoading}
                                        className={`
                                            inline-flex items-center gap-1.5 text-sm font-medium transition-colors
                                            ${cooldown > 0 || resendLoading
                                                ? "text-neutral-600 cursor-not-allowed"
                                                : "text-white hover:text-neutral-300"}
                                        `}
                                    >
                                        <RefreshCw size={13} className={resendLoading ? "animate-spin" : ""} />
                                        {resendLoading
                                            ? "Sending…"
                                            : cooldown > 0
                                                ? `Resend in ${formatCooldown(cooldown)}`
                                                : "Resend code"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom accent line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <p className="text-center text-xs text-neutral-600 mt-6">
                    Code expires in 10 minutes · Check your spam folder if needed
                </p>
            </div>
        </div>
    );
}
