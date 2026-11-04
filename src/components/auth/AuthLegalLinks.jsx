import { Link } from "react-router-dom";

// Small print under the login / signup forms (rendered by GoogleAuthButton, which both pages share)
export default function AuthLegalLinks() {
    return (
        <p className="pt-2 text-center text-[11px] leading-relaxed text-ink-300">
            By continuing, you agree to CliQ&apos;s{" "}
            <Link
                to="/terms"
                className="rounded-sm underline underline-offset-2 decoration-white/30 hover:text-white hover:decoration-white transition-colors duration-150 focus-ring"
            >
                Terms of Service
            </Link>{" "}
            and{" "}
            <Link
                to="/privacy"
                className="rounded-sm underline underline-offset-2 decoration-white/30 hover:text-white hover:decoration-white transition-colors duration-150 focus-ring"
            >
                Privacy Policy
            </Link>
            .
        </p>
    );
}
