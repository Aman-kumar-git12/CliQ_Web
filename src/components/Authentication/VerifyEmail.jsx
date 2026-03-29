import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const { setUser } = useUserContext();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Verification token is missing from the link.");
            return;
        }

        const verifyEmail = async () => {
            try {
                // withCredentials: true so the auth cookie set by the backend is stored
                const response = await axiosClient.get("/auth/verify-email", {
                    params: { token },
                    withCredentials: true,
                });

                const verifiedUser = response.data?.user || null;
                if (verifiedUser) {
                    // Sync the user context — cookie is already set by backend
                    setUser(verifiedUser);
                }

                setStatus("success");
                setMessage(response.data?.message || "Email verified successfully! Redirecting...");

                // Auto-redirect to home after a short delay so user sees the success message
                setTimeout(() => {
                    navigate("/home", { replace: true });
                }, 2000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || "Email verification failed.";
                setStatus("error");
                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [searchParams, setUser, navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
                <h1 className="text-3xl font-semibold mb-4">Email Verification</h1>
                <p className={`${status === "error" ? "text-red-400" : status === "success" ? "text-green-400" : "text-neutral-300"} text-base leading-relaxed`}>
                    {message}
                </p>

                {status === "loading" && (
                    <div className="mt-6 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                    </div>
                )}

                {status === "success" && (
                    <div className="mt-6 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-400" />
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-8">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
