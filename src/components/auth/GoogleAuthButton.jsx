import AuthLegalLinks from "./AuthLegalLinks";
import { authSecondaryButtonClass } from "./authStyles";

export default function GoogleAuthButton({ label = "continue_with" }) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const mode = label === "signup_with" ? "signup" : "signin";
    const buttonText = mode === "signup" ? "Sign up with Google" : "Sign in with Google";

    const handleClick = () => {
        if (!backendUrl) {
            return;
        }

        window.location.href = `${backendUrl}/auth/google?mode=${mode}`;
    };

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={handleClick}
                disabled={!backendUrl}
                className={`${authSecondaryButtonClass} gap-3 px-5 text-sm font-semibold`}
            >
                <span className="text-lg leading-none" aria-hidden="true">
                    G
                </span>
                <span>{buttonText}</span>
            </button>
            {!backendUrl ? <p className="text-center text-sm text-red-300">Google sign-in is not configured.</p> : null}
            <AuthLegalLinks />
        </div>
    );
}
