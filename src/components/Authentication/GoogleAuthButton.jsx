import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
        if (existingScript) {
            if (window.google?.accounts?.id) {
                resolve();
            } else {
                existingScript.addEventListener("load", resolve, { once: true });
                existingScript.addEventListener("error", reject, { once: true });
            }
            return;
        }

        const script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export default function GoogleAuthButton() {
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const renderedRef = useRef(false);
    const [error, setError] = useState("");
    const { setUser, setBlockedAccount, setBlockedEmail, setBlockedMessage } = useUserContext();

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || !buttonRef.current) {
            setError("Google sign-in is not configured.");
            return;
        }

        let isMounted = true;

        const initialize = async () => {
            try {
                await loadGoogleScript();
                if (!isMounted || !window.google?.accounts?.id || renderedRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        try {
                            setError("");
                            const { data } = await axiosClient.post("/auth/google", {
                                credential: response.credential,
                            });
                            setBlockedAccount(false);
                            setBlockedEmail("");
                            setUser(data.user);
                            navigate("/home");
                        } catch (authError) {
                            if (authError.response?.status === 403) {
                                const blockedMsg = authError.response?.data?.message || "This account has been blocked.";
                                const fallbackEmail = authError.response?.data?.email || "";
                                setBlockedAccount(true);
                                setBlockedMessage(blockedMsg);
                                setBlockedEmail(fallbackEmail);
                                navigate("/blocked-account", { replace: true });
                                return;
                            }
                            setError(authError.response?.data?.message || "Google login failed.");
                        }
                    },
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    width: buttonRef.current.offsetWidth || 320,
                    text: "continue_with",
                });

                renderedRef.current = true;
            } catch (scriptError) {
                setError("Could not load Google sign-in.");
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, [navigate, setBlockedAccount, setBlockedEmail, setBlockedMessage, setUser]);

    return (
        <div className="space-y-3">
            <div ref={buttonRef} className="w-full overflow-hidden rounded-full" />
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
    );
}
