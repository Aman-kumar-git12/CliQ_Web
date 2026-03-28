import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Signup() {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: "",
        terms: false,
    });
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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
        try {
            const response = await axiosClient.post("/signup", formData);
            console.log(response)
            setUser(response.data.user);
            navigate("/home");
            setShowErr(false);
            setError(null);
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || "Signup failed";

            setShowErr(true);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-semibold">One step away</h1>
                <h2 className="italic text-4xl sm:text-5xl text-gray-200">
                    from great bread
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
                {/* Title */}
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">Register Now!</h3>

                    <div className="flex items-center gap-0.5 text-sm">
                        <span className="text-gray-300">Already registered?</span>
                        <Link
                            to="/login"
                            className="underline hover:text-gray-200 transition"
                        >
                            Login
                        </Link>
                    </div>
                </div>

                {/* FIRST NAME + LAST NAME */}
                <div className="flex gap-2">
                    {/* First Name */}
                    <div className="flex items-center border border-gray-600 rounded px-3 py-2 w-1/2">
                        <User className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            name="firstname"
                            placeholder="First name"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="bg-transparent outline-none text-gray-200 w-full"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="flex items-center border border-gray-600 rounded px-3 py-2 w-1/2">
                        <User className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            name="lastname"
                            placeholder="Last name"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="bg-transparent outline-none text-gray-200 w-full"
                        />
                    </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-center border border-gray-600 rounded px-3 py-2">
                    <Mail className="text-gray-400 mr-2" size={18} />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-transparent outline-none text-gray-200 w-full"
                    />
                </div>

                {/* PASSWORD + AGE */}
                <div className="flex gap-2">
                    {/* Password */}
                    <div className="flex items-center border border-gray-600 rounded px-3 py-2 w-1/2 group focus-within:border-white transition-colors">
                        <Lock className="text-gray-400 mr-2 group-focus-within:text-white" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-transparent outline-none text-gray-200 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Age */}
                    <div className="flex items-center border border-gray-600 rounded px-3 py-2 w-1/2">
                        <Calendar className="text-gray-400 mr-2" size={18} />
                        <input
                            type="number"
                            name="age"
                            placeholder="Age"
                            value={formData.age}
                            onChange={handleChange}
                            className="bg-transparent outline-none text-gray-200 w-full"
                            min="1"
                        />
                    </div>
                </div>

                {/* TERMS */}
                <div className="flex items-start text-sm text-gray-400 space-x-2">
                    <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                        className="mt-1"
                    />
                    <p>
                        By creating an account, you agree to the{" "}
                        <span className="underline cursor-pointer">Terms</span> and{" "}
                        <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>

                {showErr && (
                    <div className=" text-red-600 px-4 py-2 rounded">{error}</div>
                )}

                {/* SUBMIT */}
                <button
                    disabled={loading}
                    type="submit"
                    className={`w-full bg-white text-black font-semibold py-3 rounded-full hover:opacity-90 transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                    {loading ? "Signing up..." : "Create an account"}
                </button>

                <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <GoogleAuthButton label="signup_with" />
            </form>
        </div>
    );
}
