import { ShieldAlert, LogOut, SendHorizontal, Loader2, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useUserContext } from "../context/userContext";

export default function BlockedAccount() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { blockedMessage, blockedEmail, setBlockedAccount, setBlockedMessage, setBlockedEmail, setUser } = useUserContext();
    const fallbackBlockedMessage = useMemo(
        () => searchParams.get("message") || blockedMessage || "This account has been blocked. If you think this was a mistake, you can request an unblock review.",
        [blockedMessage, searchParams]
    );
    const fallbackBlockedEmail = useMemo(
        () => searchParams.get("email") || blockedEmail || "",
        [blockedEmail, searchParams]
    );
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestEmail, setRequestEmail] = useState(fallbackBlockedEmail);
    const [requestMessage, setRequestMessage] = useState("");
    const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout");
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
            setSubmitState({ loading: false, error: "Please explain why your account should be unblocked.", success: "" });
            return;
        }

        try {
            setSubmitState({ loading: true, error: "", success: "" });
            await axiosClient.post("/auth/unblock-request", {
                email: requestEmail.trim().toLowerCase(),
                message: requestMessage.trim(),
            });
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
            setTimeout(() => {
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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_35%),linear-gradient(180deg,#060606,#111217)] text-white flex items-center justify-center px-4">
            <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(23,23,27,0.96),rgba(10,10,13,0.98))] p-8 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <ShieldAlert size={30} className="text-red-400" />
                </div>

                <div className="text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-red-300/70">Account Status</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white">This Account Has Been Blocked</h1>
                    <p className="mt-4 text-[15px] leading-7 text-neutral-300">
                        {fallbackBlockedMessage}
                    </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                        onClick={() => {
                            setShowRequestForm((prev) => !prev);
                            setSubmitState((prev) => ({ ...prev, error: "", success: "" }));
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 text-sm font-bold text-white transition hover:brightness-110"
                    >
                        <SendHorizontal size={18} />
                        Ask For Unblock
                    </button>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                        <LogOut size={18} />
                        Back To Login
                    </button>
                </div>

                {showRequestForm && (
                    <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-red-200/70">Defend Yourself</p>
                        <p className="mt-3 text-sm leading-6 text-neutral-300">
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
                            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-red-400/40"
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
                            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-red-400/40"
                        />

                        {submitState.error && (
                            <p className="mt-3 text-sm text-red-300">{submitState.error}</p>
                        )}

                        <button
                            onClick={handleSubmitRequest}
                            disabled={submitState.loading}
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitState.loading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                            Submit Request
                        </button>
                    </div>
                )}

                {submitState.success && (
                    <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-left">
                        <CheckCircle2 size={20} className="mt-0.5 text-emerald-300" />
                        <p className="text-sm leading-6 text-emerald-100">{submitState.success}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
