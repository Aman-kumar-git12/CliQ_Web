import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const { setUser } = useUserContext();

    const [error, setError] = useState(null);
    const [showErr, setShowErr] = useState(false);

    const handleChange = (e) => {
        setShowErr(false); // hide error while typing
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axiosClient.post("/login", formData);
            // console.log("Login response:", response.data);
            setUser(response.data.user);
            navigate("/home");
            setShowErr(false);
            setError(null);
        } catch (err) {
            // show backend error message
            setError(err.response?.data?.error || "Something went wrong");
            setShowErr(true);
            // console.log("Login error:", err.response?.data);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-semibold">Welcome back</h1>
                <h2 className="italic text-4xl sm:text-5xl text-gray-200">
                    to great bread
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
                {/* Top Heading */}
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Login now!</h3>

                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-300">New here?</span>
                        <Link to="/" className="underline hover:text-gray-200 transition">
                            Signup
                        </Link>
                    </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div className="flex items-center border border-gray-600 rounded px-3 py-2">
                    <Lock className="text-gray-400 mr-2" size={18} />
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-transparent outline-none text-gray-200 w-full"
                    />
                </div>

                {/* Error Message */}
                {showErr && (
                    <div className="text-red-600 px-4 py-2 rounded">{error}</div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-white text-black font-semibold py-3 rounded-full hover:opacity-90"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
