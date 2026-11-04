import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../../api/auth";
import { useUserContext } from "../../context/UserContext";
import { authCardClass, authPageClass, authPrimaryButtonClass } from "../../components/auth/authStyles";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const { setUser } = useUserContext();
    const navigate = useNavigate();
    const redirectTimerRef = useRef(null);

    // The delayed redirect to home must not fire after the user has already left
    useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing from the link.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const data = await authApi.verifyEmail(token);

                const verifiedUser = data?.user || null;
                if (verifiedUser) {
                    // Sync the user context — cookie is already set by backend
                    setUser(verifiedUser);
                }

                setStatus("success");
                setMessage(data?.message || "Email verified successfully! Redirecting...");

                // Auto-redirect to home after a short delay so user sees the success message
                redirectTimerRef.current = setTimeout(() => {
                    navigate("/home", { replace: true });
                }, 2000);
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message || error.response?.data?.error || "Email verification failed.";
                setStatus("error");
                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [searchParams, setUser, navigate]);

    return (
        <div className={authPageClass}>
            <div className={`${authCardClass} max-w-md p-8 text-center`}>
                <h1 className="text-3xl font-semibold tracking-tight mb-4">Email Verification</h1>
                {status === "loading" ? (
                    // The result message (and its button) are on their way: placeholder lines in their place
                    <div
                        role="status"
                        aria-label="Verifying your email"
                        aria-busy="true"
                        className="flex flex-col items-center motion-safe:animate-pulse"
                    >
                        <div className="h-4 w-3/4 rounded-full bg-white/[0.08] mt-1.5"></div>
                        <div className="h-4 w-1/2 rounded-full bg-white/[0.05] mt-2.5"></div>
                        <div className="mt-8 h-12 w-36 rounded-full bg-white/[0.08]"></div>
                    </div>
                ) : (
                    <p
                        role={status === "error" ? "alert" : undefined}
                        className={`${status === "error" ? "text-red-300" : "text-emerald-300"} text-base leading-relaxed`}
                    >
                        {message}
                    </p>
                )}

                {status === "success" && (
                    <div className="mt-6 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-8">
                        <Link to="/login" className={`${authPrimaryButtonClass} !w-auto px-6`}>
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
