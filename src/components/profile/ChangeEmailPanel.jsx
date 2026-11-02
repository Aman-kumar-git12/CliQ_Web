import { useState } from "react";
import * as usersApi from "../../api/users";

const inputClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-xl transition-all text-white placeholder-white/20 font-bold";
const labelClass = "block mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1";
const buttonClass =
    "px-5 py-3 rounded-2xl text-[11px] font-black uppercase italic tracking-widest transition-all disabled:opacity-50";

const errorText = (error) => error.response?.data?.message || "Something went wrong. Try again.";

/**
 * Email address with a two-step change: a code goes to the new address, and the change applies
 * only once that code is entered (so nobody can move an account to an inbox they don't own).
 * Accounts that sign in with Google keep their Google email.
 */
export default function ChangeEmailPanel({ email, canChange, onChanged }) {
    const [step, setStep] = useState("view"); // view | request | confirm
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const reset = () => {
        setStep("view");
        setNewEmail("");
        setCurrentPassword("");
        setOtp("");
        setError("");
    };

    const run = async (action) => {
        setBusy(true);
        setError("");
        try {
            await action();
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const sendCode = () =>
        run(async () => {
            const data = await usersApi.requestEmailChange({ newEmail, currentPassword }, { silent: true });
            setMessage(data.message);
            setStep("confirm");
        });

    const confirm = () =>
        run(async () => {
            const data = await usersApi.confirmEmailChange(otp, { silent: true });
            onChanged?.(data.user);
            setMessage(data.message);
            reset();
        });

    return (
        <div>
            <span className={labelClass}>Email Address</span>
            <div className="flex items-center gap-3">
                <p className="flex-1 truncate text-white font-bold px-1" data-testid="current-email">
                    {email}
                </p>
                {canChange && step === "view" && (
                    <button
                        type="button"
                        onClick={() => setStep("request")}
                        className={`${buttonClass} border border-white/10 text-white hover:bg-white/5`}
                    >
                        Change
                    </button>
                )}
            </div>
            {!canChange && (
                <p className="mt-2 ml-1 text-[12px] text-white/40">
                    This account signs in with Google and uses its email.
                </p>
            )}
            {message && step === "view" && <p className="mt-2 ml-1 text-[12px] text-emerald-400">{message}</p>}

            {step !== "view" && (
                <div className="mt-4 space-y-4 rounded-2xl border border-white/10 p-4">
                    {step === "request" ? (
                        <>
                            <div>
                                <label htmlFor="new-email" className={labelClass}>
                                    New email
                                </label>
                                <input
                                    id="new-email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className={inputClass}
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <label htmlFor="email-current-password" className={labelClass}>
                                    Current password
                                </label>
                                <input
                                    id="email-current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={inputClass}
                                    autoComplete="current-password"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <p className="mb-3 ml-1 text-[12px] text-white/60">{message}</p>
                            <label htmlFor="email-otp" className={labelClass}>
                                6-digit code
                            </label>
                            <input
                                id="email-otp"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className={inputClass}
                                autoComplete="one-time-code"
                            />
                        </div>
                    )}

                    {error && <p className="ml-1 text-[12px] text-red-400">{error}</p>}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            disabled={busy || (step === "request" ? !newEmail || !currentPassword : otp.length !== 6)}
                            onClick={step === "request" ? sendCode : confirm}
                            className={`${buttonClass} bg-white text-black hover:scale-105`}
                        >
                            {step === "request" ? "Send code" : "Confirm"}
                        </button>
                        <button
                            type="button"
                            onClick={reset}
                            className={`${buttonClass} border border-white/10 text-white hover:bg-white/5`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
