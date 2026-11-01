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
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span className="text-lg leading-none">G</span>
                <span>{buttonText}</span>
            </button>
            {!backendUrl ? <p className="text-sm text-red-500">Google sign-in is not configured.</p> : null}
        </div>
    );
}
