import { ShieldAlert, LogOut, SendHorizontal, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../../api/auth";
import { useUserContext } from "../../context/UserContext";
import { MotionConfig, motion } from "framer-motion";
import { authAppear, authSpinnerClass } from "../../components/auth/authStyles";

export default function BlockedAccountPage() {
    const navigate = useNavigate();
    const redirectTimerRef = useRef(null);

    // The delayed redirect to login must not fire after the user has already left
    useEffect(() => () => clearTimeout(redirectTimerRef.current), []);
    const [searchParams] = useSearchParams();
    const { blockedMessage, blockedEmail, setBlockedAccount, setBlockedMessage, setBlockedEmail, setUser } =
        useUserContext();
    const fallbackBlockedMessage = useMemo(
        () =>
            searchParams.get("message") ||
            blockedMessage ||
            "This account has been blocked. If you think this was a mistake, you can request an unblock review.",
        [blockedMessage, searchParams],
    );
    const fallbackBlockedEmail = useMemo(
        () => searchParams.get("email") || blockedEmail || "",
        [blockedEmail, searchParams],
    );
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestEmail, setRequestEmail] = useState(fallbackBlockedEmail);
    const [requestMessage, setRequestMessage] = useState("");
    const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout after block notice failed:", error);
        } finally {
            setUser(null);
            setBlockedAccount(false);
            setBlockedMessage("This account has been blocked.");
            setBlockedEmail("");
            navigate("/login", { replace: true });
        }
    };

    const handleSubmitRequest = async () => {
        if (!requestEmail.trim()) {
            setSubmitState({ loading: false, error: "Please enter the blocked account email.", success: "" });
            return;
        }

        if (!requestMessage.trim()) {
            setSubmitState({
                loading: false,
                error: "Please explain why your account should be unblocked.",
                success: "",
            });
            return;
        }

        try {
            setSubmitState({ loading: true, error: "", success: "" });
            await authApi.requestUnblock(
                {
                    email: requestEmail.trim().toLowerCase(),
                    message: requestMessage.trim(),
                },
                { silent: true },
            );
            setSubmitState({
                loading: false,
                error: "",
                success: "Your unblock request has been submitted. Our team will review it.",
            });
            setShowRequestForm(false);
            setRequestMessage("");
            setBlockedAccount(false);
            setBlockedMessage("This account has been blocked.");
            setBlockedEmail("");
            redirectTimerRef.current = setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch (error) {
            setSubmitState({
                loading: false,
                error: error.response?.data?.message || "Could not submit your unblock request right now.",
                success: "",
            });
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-surface-950 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.10),transparent_40%)] text-white flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl rounded-[32px] border border-line bg-surface-800/90 backdrop-blur-xl p-6 sm:p-10 shadow-soft-lg">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                        <ShieldAlert size={30} className="text-red-400" />
                    </div>

                    <div className="text-center">
                        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-red-300/70">
                            Account Status
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
                            This Account Has Been Blocked
                        </h1>
                        <p className="mt-4 text-[15px] leading-7 text-ink-200">{fallbackBlockedMessage}</p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <button
                            onClick={() => {
                                setShowRequestForm((prev) => !prev);
                                setSubmitState((prev) => ({ ...prev, error: "", success: "" }));
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/90 px-5 py-4 text-sm font-bold text-white shadow-soft hover:bg-red-500 cliq-press focus-ring"
                        >
                            <SendHorizontal size={18} />
                            Ask For Unblock
                        </button>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-white/5 px-5 py-4 text-sm font-bold text-white hover:bg-white/10 hover:border-line-strong cliq-press focus-ring"
                        >
                            <LogOut size={18} />
                            Back To Login
                        </button>
                    </div>

                    {showRequestForm && (
                        <motion.div
                            {...authAppear}
                            className="mt-5 rounded-[24px] border border-line bg-white/[0.04] p-5"
                        >
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-200/70">
                                Defend Yourself
                            </p>
                            <p className="mt-3 text-sm leading-6 text-ink-200">
                                Tell us why your account should be reviewed and unblocked. Keep it clear and honest.
                            </p>
                            <input
                                type="email"
                                value={requestEmail}
                                onChange={(event) => {
                                    setRequestEmail(event.target.value);
                                    if (submitState.error) {
                                        setSubmitState((prev) => ({ ...prev, error: "" }));
                                    }
                                }}
                                placeholder="Enter your blocked account email"
                                aria-label="Blocked account email"
                                className="mt-4 w-full rounded-2xl border border-line bg-black/20 px-4 py-3 text-base sm:text-sm text-white outline-none placeholder:text-ink-300 transition-[border-color,box-shadow,background-color] duration-150 ease-soft hover:border-line-strong focus:border-red-400/50 focus:ring-4 focus:ring-red-500/10 focus:bg-black/30"
                            />
                            <textarea
                                value={requestMessage}
                                onChange={(event) => {
                                    setRequestMessage(event.target.value);
                                    if (submitState.error) {
                                        setSubmitState((prev) => ({ ...prev, error: "" }));
                                    }
                                }}
                                rows={5}
                                placeholder="Explain your side of the issue and why your account should be unblocked..."
                                aria-label="Why should your account be unblocked?"
                                className="mt-4 w-full resize-none rounded-2xl border border-line bg-black/20 px-4 py-3 text-base sm:text-sm text-white outline-none placeholder:text-ink-300 transition-[border-color,box-shadow,background-color] duration-150 ease-soft hover:border-line-strong focus:border-red-400/50 focus:ring-4 focus:ring-red-500/10 focus:bg-black/30"
                            />

                            {submitState.error && (
                                <motion.p {...authAppear} role="alert" className="mt-3 text-sm text-red-300">
                                    {submitState.error}
                                </motion.p>
                            )}

                            <button
                                onClick={handleSubmitRequest}
                                disabled={submitState.loading}
                                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black shadow-soft hover:bg-white/90 cliq-press focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitState.loading ? (
                                    <span className={authSpinnerClass} aria-hidden="true" />
                                ) : (
                                    <SendHorizontal size={18} />
                                )}
                                Submit Request
                            </button>
                        </motion.div>
                    )}

                    {submitState.success && (
                        <motion.div
                            {...authAppear}
                            role="status"
                            className="mt-5 flex items-start gap-3 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-left"
                        >
                            <CheckCircle2 size={20} className="mt-0.5 text-emerald-300" />
                            <p className="text-sm leading-6 text-emerald-100">{submitState.success}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </MotionConfig>
    );
}
