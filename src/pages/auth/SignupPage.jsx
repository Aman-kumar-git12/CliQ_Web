import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";
import * as authApi from "../../api/auth";
import { useUserContext } from "../../context/UserContext";
import { MotionConfig, motion } from "framer-motion";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import {
    authAppear,
    authCardClass,
    authFieldButtonClass,
    authFieldClass,
    authFieldIconClass,
    authInputClass,
    authLinkClass,
    authNoticeClass,
    authPageClass,
    authPrimaryButtonClass,
    authSpinnerClass,
} from "../../components/auth/authStyles";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: "",
        terms: false,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const { setUser } = useUserContext();
    const [error, setError] = useState(null);
    const [showErr, setShowErr] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const authError = searchParams.get("authError");
        if (authError) {
            setError(authError);
            setShowErr(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleChange = (e) => {
        setShowErr(false);
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.terms) {
            setError("You must agree to the Terms and Privacy Policy to create an account.");
            setShowErr(true);
            setLoading(false);
            return;
        }

        try {
            const data = await authApi.signup(formData, { silent: true });
            setUser(null);
            // Redirect to OTP verification page, passing email via route state
            navigate("/verify-otp", {
                state: { email: data?.email || formData.email },
                replace: true,
            });
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || "Signup failed";
            setShowErr(true);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const termsError = showErr && error?.includes("Terms");

    return (
        <MotionConfig reducedMotion="user">
            <div className={authPageClass}>
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">One step away</h1>
                    <h2 className="italic text-4xl sm:text-5xl text-white/70 tracking-tight">from joining CliQ</h2>
                </div>

                <form onSubmit={handleSubmit} className={`${authCardClass} max-w-sm p-5 sm:p-7 space-y-5`}>
                    {/* Title */}
                    <div className="flex justify-between items-center gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight">Register Now!</h3>

                        <div className="flex items-center gap-1 text-sm shrink-0">
                            <span className="text-ink-300">Already registered?</span>
                            <Link to="/login" className={`text-white/90 ${authLinkClass}`}>
                                Login
                            </Link>
                        </div>
                    </div>

                    {/* FIRST NAME + LAST NAME */}
                    <div className="flex gap-2">
                        {/* First Name */}
                        <div className={`${authFieldClass()} w-1/2`}>
                            <User className={authFieldIconClass} size={18} aria-hidden="true" />
                            <input
                                type="text"
                                name="firstname"
                                placeholder="First name"
                                aria-label="First name"
                                autoComplete="given-name"
                                value={formData.firstname}
                                onChange={handleChange}
                                className={authInputClass}
                            />
                        </div>

                        {/* Last Name */}
                        <div className={`${authFieldClass()} w-1/2`}>
                            <User className={authFieldIconClass} size={18} aria-hidden="true" />
                            <input
                                type="text"
                                name="lastname"
                                placeholder="Last name"
                                aria-label="Last name"
                                autoComplete="family-name"
                                value={formData.lastname}
                                onChange={handleChange}
                                className={authInputClass}
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className={authFieldClass()}>
                        <Mail className={authFieldIconClass} size={18} aria-hidden="true" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            aria-label="Email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={authInputClass}
                        />
                    </div>

                    {/* PASSWORD + AGE */}
                    <div className="flex gap-2">
                        {/* Password */}
                        <div className={`${authFieldClass()} w-1/2`}>
                            <Lock className={authFieldIconClass} size={18} aria-hidden="true" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                aria-label="Password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                className={authInputClass}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className={authFieldButtonClass}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Age */}
                        <div className={`${authFieldClass()} w-1/2`}>
                            <Calendar className={authFieldIconClass} size={18} aria-hidden="true" />
                            <input
                                type="number"
                                name="age"
                                placeholder="Age"
                                aria-label="Age"
                                inputMode="numeric"
                                value={formData.age}
                                onChange={handleChange}
                                className={authInputClass}
                                min="1"
                            />
                        </div>
                    </div>

                    {/* TERMS */}
                    <div
                        className={`flex items-start gap-2.5 text-sm leading-relaxed transition-colors duration-150 ${termsError ? "text-red-300" : "text-ink-300"}`}
                    >
                        <input
                            type="checkbox"
                            name="terms"
                            aria-label="I agree to the Terms and Privacy Policy"
                            aria-invalid={termsError || undefined}
                            checked={formData.terms}
                            onChange={handleChange}
                            className={`mt-1 h-4 w-4 shrink-0 rounded accent-brand cursor-pointer focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 ${termsError ? "ring-2 ring-red-500/70 ring-offset-2 ring-offset-surface-900" : ""}`}
                        />
                        <p>
                            By creating an account, you agree to the{" "}
                            <Link
                                to="/terms"
                                target="_blank"
                                className="underline underline-offset-4 decoration-white/30 hover:text-ink-100 cliq-transition focus-ring rounded"
                            >
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                                to="/privacy"
                                target="_blank"
                                className="underline underline-offset-4 decoration-white/30 hover:text-ink-100 cliq-transition focus-ring rounded"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>

                    {showErr && (
                        <motion.div {...authAppear} role="alert" className={authNoticeClass.error}>
                            {error}
                        </motion.div>
                    )}

                    {/* SUBMIT */}
                    <button disabled={loading} type="submit" className={authPrimaryButtonClass}>
                        {loading && <span className={authSpinnerClass} aria-hidden="true" />}
                        {loading ? "Signing up..." : "Create an account"}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs uppercase tracking-[0.25em] text-ink-400">or</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <GoogleAuthButton label="signup_with" />
                </form>
            </div>
        </MotionConfig>
    );
}
