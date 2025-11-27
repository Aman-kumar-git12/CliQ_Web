import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: "",
        imageUrl: "",
    });

    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch existing profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", form , { withCredentials: true });
                const user = res.data.user;

                setForm({
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    password: "",
                    age: user.age,
                    imageUrl: user.imageUrl || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Submit & send to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(form);

        try {
            const res = await axiosClient.put("/profile/edit", form, {
                withCredentials: true,
            });

            console.log("Updated:", res.data);

            navigate("/profile");
        } catch (error) {
            console.error("Update failed:", error);
            setErrorMsg(error.response?.data?.error || "Something went wrong. Try again.");
        }
    };

    if (loading)
        return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="flex justify-center w-full mt-10">
            <div className="w-full max-w-xl bg-[#111] border border-gray-800 p-6 rounded-2xl shadow-2xl text-white">
                <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

                {errorMsg && (
                    <div className="text-red-500 bg-red-900/20 border border-red-700 p-2 rounded-md mb-3 text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block mb-1 text-gray-300">First Name</label>
                        <input
                            type="text"
                            name="firstname"
                            value={form.firstname}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-300">Last Name</label>
                        <input
                            type="text"
                            name="lastname"
                            value={form.lastname}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-300">Password (Optional)</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                            placeholder="Leave blank to keep old password"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-300">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-300">Profile Image URL</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={form.imageUrl}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-[#222] border border-gray-700 text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl mt-4"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
