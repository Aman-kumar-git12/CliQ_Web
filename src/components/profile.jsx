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

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout", {}, { withCredentials: true });
            setUser(null);
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
        <div className="w-full mt-0 pt-4 px-3 pb-10">
            <div className="w-full">

                {/* PROFILE CARD */}
                <div className="bg-[#111] border border-gray-800 text-white shadow-2xl rounded-2xl p-6 sm:p-8">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={user.imageUrl}
                            alt="User"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-700"
                        />
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-semibold">
                                {user.firstname} {user.lastname}
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base">{user.email}</p>
                        </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="space-y-3 text-gray-300 text-sm sm:text-base">
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
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link
                            to="/edit-profile"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-center"
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

                {/* POSTS + GRID */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        My Posts
                    </h2>

                    {!loadingPosts && posts.length === 0 && (
                        <p className="text-gray-400">No posts found.</p>
                    )}

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center h-40 sm:h-48"
                            >
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="User Post"
                                        className="object-cover w-full h-full"
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
