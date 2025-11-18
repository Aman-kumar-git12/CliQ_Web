import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Calendar } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    age: "",
    terms: false,
  });
  const nevigate = useNavigate();
  const [error, setError] = useState(null);
  const [showErr, setShowErr] = useState(false);

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
    try {
      const response = await axiosClient.post("/signup", formData);
      console.log(response)
      nevigate("/home");
      setShowErr(false);
      setError(null);
      // console.log("Signup response:", response.data);
    } catch (error) {
      setShowErr(error.response?.data.error);
      setError(error.response?.data.error || "Signup failed");
      // console.log("Signup error:", error.response?.data);
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
            type="text"
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
          <div className="flex items-center border border-gray-600 rounded px-3 py-2 w-1/2">
            <Lock className="text-gray-400 mr-2" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-transparent outline-none text-gray-200 w-full"
            />
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
          type="submit"
          className="w-full bg-white text-black font-semibold py-3 rounded-full hover:opacity-90"
        >
          Create an account
        </button>
      </form>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const nevigate = useNavigate();

  const [Error, setError] = useState(null);
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
      nevigate("/home");
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
            type="text"
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
          <div className="text-red-600 px-4 py-2 rounded">{Error}</div>
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
};

export { Signup, Login };
