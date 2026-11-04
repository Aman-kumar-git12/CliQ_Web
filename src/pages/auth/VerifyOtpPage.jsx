import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, RefreshCw, ArrowRight, CheckCircle } from "lucide-react";
import * as authApi from "../../api/auth";
import { useUserContext } from "../../context/UserContext";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
    authAppear,
    authCardClass,
    authNoticeClass,
    authPageClass,
    authPrimaryButtonClass,
    authSpinnerClass,
} from "../../components/auth/authStyles";
import { EASE_SOFT } from "../../components/common/motionPresets";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECS = 60; // 1 min initial UI cooldown; backend enforces 10 min real cooldown

export default function VerifyOtpPage() {
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
    const redirectTimerRef = useRef(null);

    // The cooldown ticker and the delayed redirect must not run after the user has left
    useEffect(
        () => () => {
            clearInterval(timerRef.current);
            clearTimeout(redirectTimerRef.current);
        },
        [],
    );

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
            const data =
                intent === "reset_password"
                    ? await authApi.resetPassword({ email, otp, newPassword }, { silent: true })
                    : await authApi.verifyOtp({ email, otp }, { silent: true });

            const verifiedUser = data?.user || null;
            if (verifiedUser) {
                setUser(verifiedUser);
            }

            setSuccess(true);
            redirectTimerRef.current = setTimeout(() => {
                navigate("/home", { replace: true });
            }, 1500);
        } catch (err) {
            const msg =
                err.response?.data?.message || err.response?.data?.error || "Verification failed. Please try again.";
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
            const data =
                intent === "reset_password"
                    ? await authApi.forgotPassword(email, { silent: true })
                    : await authApi.resendVerification(email, { silent: true });
            setResendMessage(data?.message || "A new code has been sent to your email.");
            setDigits(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN_SECS);
        } catch (err) {
            const msg =
                err.response?.data?.message || err.response?.data?.error || "Unable to resend. Please try again later.";
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
    const isIncomplete = digits.some((d) => !d);

    return (
        <MotionConfig reducedMotion="user">
            <div className={authPageClass}>
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className={`${authCardClass} overflow-hidden`}>
                        {/* Top accent line */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-light/40 to-transparent" />

                        <div className="px-6 py-10 sm:px-8">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div
                                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors duration-300 ease-soft ${success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-brand/10 border-brand/20"}`}
                                >
                                    <Mail
                                        size={24}
                                        className={`transition-colors duration-300 ${success ? "text-emerald-300" : "text-brand-light"}`}
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </div>

                            {/* Heading */}
                            <div className="text-center mb-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {success
                                        ? intent === "reset_password"
                                            ? "Password Reset!"
                                            : "Verified!"
                                        : intent === "reset_password"
                                          ? "Password Reset"
                                          : "Check your email"}
                                </h1>
                            </div>
                            <p className="text-center text-sm text-ink-300 mb-8 leading-relaxed">
                                {success ? (
                                    "Redirecting you to your feed…"
                                ) : (
                                    <>
                                        We sent a 6-digit code to{" "}
                                        <span className="text-white font-medium break-all">{email}</span>
                                    </>
                                )}
                            </p>

                            <AnimatePresence mode="wait" initial={false}>
                                {/* Success state */}
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.25, ease: EASE_SOFT }}
                                        className="flex justify-center"
                                    >
                                        <CheckCircle size={48} className="text-emerald-400" strokeWidth={1.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" {...authAppear}>
                                        {/* OTP Digit Boxes */}
                                        <div
                                            className="flex justify-center gap-2 sm:gap-2.5 mb-6"
                                            onPaste={handlePaste}
                                        >
                                            {digits.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => (inputRefs.current[i] = el)}
                                                    id={`otp-digit-${i}`}
                                                    aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                                                    aria-invalid={error ? true : undefined}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleDigitChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                                    disabled={loading}
                                                    className={`
                                                        w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-semibold rounded-xl tabular-nums
                                                        bg-white/[0.03] border outline-none caret-transparent
                                                        transition-[border-color,box-shadow,background-color,transform] duration-150 ease-soft
                                                        ${
                                                            error
                                                                ? "border-red-400/50 text-white"
                                                                : digit
                                                                  ? "border-white/30 text-white bg-white/[0.06]"
                                                                  : "border-line text-ink-300 hover:border-line-strong"
                                                        }
                                                        focus:border-brand/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-brand/15
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                    autoComplete="one-time-code"
                                                />
                                            ))}
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <motion.p
                                                {...authAppear}
                                                role="alert"
                                                className={`${authNoticeClass.error} text-center mb-4`}
                                            >
                                                {error}
                                            </motion.p>
                                        )}

                                        {/* Resend success */}
                                        {resendMessage && (
                                            <motion.p
                                                {...authAppear}
                                                role="status"
                                                className={`${authNoticeClass.success} text-center mb-4`}
                                            >
                                                {resendMessage}
                                            </motion.p>
                                        )}

                                        {/* Verify Button */}
                                        <button
                                            onClick={() => handleSubmit()}
                                            disabled={loading || isIncomplete}
                                            className={authPrimaryButtonClass}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className={authSpinnerClass} aria-hidden="true" />
                                                    <span className="sr-only">Verifying</span>
                                                </>
                                            ) : (
                                                <>
                                                    Verify <ArrowRight size={16} aria-hidden="true" />
                                                </>
                                            )}
                                        </button>

                                        {/* Resend section */}
                                        <div className="mt-6 text-center">
                                            <p className="text-sm text-ink-300 mb-2">Didn't receive the code?</p>
                                            <button
                                                onClick={handleResend}
                                                disabled={cooldown > 0 || resendLoading}
                                                className={`
                                                    inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
                                                    transition-colors duration-150 ease-soft
                                                    focus-ring
                                                    ${
                                                        cooldown > 0 || resendLoading
                                                            ? "text-ink-400 cursor-not-allowed"
                                                            : "text-brand-light hover:text-white hover:bg-white/[0.05]"
                                                    }
                                                `}
                                            >
                                                <RefreshCw
                                                    size={13}
                                                    className={resendLoading ? "motion-safe:animate-spin" : ""}
                                                    aria-hidden="true"
                                                />
                                                <span className="tabular-nums">
                                                    {resendLoading
                                                        ? "Sending…"
                                                        : cooldown > 0
                                                          ? `Resend in ${formatCooldown(cooldown)}`
                                                          : "Resend code"}
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom accent line */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <p className="text-center text-xs text-ink-400 mt-6 leading-relaxed">
                        Code expires in 10 minutes · Check your spam folder if needed
                    </p>
                </div>
            </div>
        </MotionConfig>
    );
}
