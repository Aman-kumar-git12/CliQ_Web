import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";

export default function ProfilePage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    // Fetch logged-in user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get("/profile", {
                    withCredentials: true,
                });
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Fetch user's posts after profile loads
    useEffect(() => {
        if (!user) return;

        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get(`/user/post/${user.id}`, {
                    withCredentials: true,
                });
                setPosts(res.data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [user]);

    // Logout Handler
    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout", {}, { withCredentials: true });

            // Clear frontend user state
            setUser(null);

            // Redirect to login
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading)
        return <div className="text-center text-white mt-10">Loading...</div>;

    if (!user)
        return <div className="text-center text-white mt-10">No user found</div>;

    return (
        <div className="flex justify-center w-full mt-10">
            <div className="w-full max-w-2xl">

                {/* PROFILE CARD */}
                <div className="bg-[#111] border border-gray-800 text-white shadow-2xl rounded-2xl p-6">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={user.imageUrl}
                            alt="User"
                            className="w-16 h-16 rounded-full object-cover border border-gray-700"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">
                                {user.firstname} {user.lastname}
                            </h2>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="space-y-3 text-gray-300">
                        <p>
                            <span className="font-medium text-white">User ID:</span>{" "}
                            {`${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}
                        </p>
                        <p>
                            <span className="font-medium text-white">Age:</span> {user.age}
                        </p>
                        <p>
                            <span className="font-medium text-white">Joined:</span>{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-4 mt-8">
                        <Link
                            to="/edit-profile"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                        >
                            Edit Profile
                        </Link>

                        <button
                            onClick={() => setShowLogoutPopup(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* MY POSTS SECTION */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-white mb-4">My Posts</h2>

                    {loadingPosts && (
                        <p className="text-gray-400">Loading posts...</p>
                    )}

                    {!loadingPosts && posts.length === 0 && (
                        <p className="text-gray-400">No posts found.</p>
                    )}

                    {/* GRID: 3 images per row */}
                    <div className="grid grid-cols-3 gap-0.5">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center h-50"
                            >
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="User Post"
                                        className="object-contain max-h-full"
                                        style={{ width: "auto" }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={handleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />
        </div>
    );
}
