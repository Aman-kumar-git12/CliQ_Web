import { Link } from "react-router-dom";

// Small print under the login / signup forms (rendered by GoogleAuthButton, which both pages share)
export default function AuthLegalLinks() {
    return (
        <p className="pt-2 text-center text-[11px] leading-relaxed text-neutral-400">
            By continuing, you agree to CliQ&apos;s{" "}
            <Link to="/terms" className="underline hover:text-white transition-colors">
                Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
            </Link>
            .
        </p>
    );
}
