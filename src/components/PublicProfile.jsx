import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import MyExperties from "./MyExperties/MyExperties";

import { X, ArrowLeft, MessageSquare } from "lucide-react";

export default function PublicProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showExpertiseModal, setShowExpertiseModal] = useState(false);
    const [snack, setSnack] = useState("");

    // Initialize state from localStorage if available
    const [connectionStatus, setConnectionStatus] = useState(() => {
        return localStorage.getItem(`connection_status_${userId}`) || "none";
    });

    // Check connection status - Depends on 'user' being loaded to ensure we have the DB ID
    useEffect(() => {
        if (!user) return;

        const fetchConnectionStatus = async () => {
            try {
                const res = await axiosClient.get(`/user/connections/${user.id}`);

                // Assuming response structure: { status: "accepted" | "interested" | ... }
                // or { connection: { status: ... } }
                const status = res.data.status || (res.data.connection && res.data.connection.status);

                if (status) {
                    if (status === "accepted") {
                        setConnectionStatus("following");
                        localStorage.setItem(`connection_status_${user.id}`, "following");
                    } else if (status === "interested") {
                        setConnectionStatus("interested");
                        localStorage.setItem(`connection_status_${user.id}`, "interested");
                    } else {
                        setConnectionStatus(status);
                        localStorage.setItem(`connection_status_${user.id}`, status);
                    }
                } else {
                    // If no status returned, assume none
                    setConnectionStatus("none");
                    localStorage.removeItem(`connection_status_${user.id}`);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // No connection found
                    setConnectionStatus("none");
                    localStorage.removeItem(`connection_status_${user.id}`);
                } else {
                    console.error("Error fetching connection status:", error);
                }
            }
        };

        fetchConnectionStatus();
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get(`/user/${userId}`);
                setUser(res.data.user);
                // Note: We prioritize localStorage for immediate UI consistency, 
                // but ideally API should return this status.
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (!user) return;

        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get(`/user/posts/${user.id}`);
                setPosts(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchPosts();
    }, [user]);

    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    const handleButtonClick = () => {
        if (connectionStatus === "none" || connectionStatus === "ignored") {
            handleFollow();
        }
    };

    const handleFollow = async () => {
        try {
            console.log("Sending follow request to:", user.id);
            await axiosClient.post(`/request/send/interested/${user.id}`);

            setConnectionStatus("interested");
            localStorage.setItem(`connection_status_${userId}`, "interested");

            showSnack("Request sent successfully");
        } catch (error) {
            console.error("Follow failed:", error);

            if (error.response && error.response.status === 409) {
                const existing = error.response.data.existing;
                if (existing) {
                    if (existing.status === "ignored") {
                        // If ignored, delete the connection and retry
                        try {
                            await axiosClient.delete(`/user/connections/cancel/${user.id}`);
                            // Retry follow
                            await axiosClient.post(`/request/send/interested/${user.id}`);
                            setConnectionStatus("interested");
                            localStorage.setItem(`connection_status_${userId}`, "interested");
                            showSnack("Request sent successfully");
                        } catch (retryError) {
                            console.error("Retry follow failed:", retryError);
                            showSnack("Failed to send request");
                        }
                    } else if (existing.status === "interested") {
                        setConnectionStatus("interested");
                        localStorage.setItem(`connection_status_${userId}`, "interested");
                        showSnack("Request already sent");
                    } else if (existing.status === "accepted") {
                        setConnectionStatus("following");
                        localStorage.setItem(`connection_status_${userId}`, "following");
                        showSnack("You are already following this user");
                    }
                }
            } else {
                showSnack("Failed to send request");
            }
        }
    };

    if (loading)
        return <div className="text-center text-white mt-10">Loading...</div>;

    if (!user)
        return <div className="text-center text-white mt-10">User not found</div>;

    return (
        <div className="w-full mt-0 pt-3 md:pt-4 px-3 pb-10">
            <div className="w-full">

                {/* BACK BUTTON - Hidden on Desktop */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex md:hidden items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                {/* PROFILE CARD */}
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-black dark:text-white shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors duration-300">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <img
                                src={user.imageUrl || "https://github.com/shadcn.png"}
                                alt="User"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
                                {user.firstname} {user.lastname}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{user.email}</p>
                        </div>
                    </div>

                    {/* USER DETAILS */}
                    <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        <p>
                            <span className="font-medium text-black dark:text-white">User ID:</span>{" "}
                            {user.username || `${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}
                        </p>
                        {user.age && (
                            <p>
                                <span className="font-medium text-black dark:text-white">Age:</span> {user.age}
                            </p>
                        )}
                        <p>
                            <span className="font-medium text-black dark:text-white">Joined:</span>{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                            onClick={handleButtonClick}
                            disabled={connectionStatus === "following" || connectionStatus === "interested"}
                            className={`px-6 py-2 rounded-xl text-center shadow-md dark:shadow-none w-full sm:w-auto font-medium transition-colors
                                ${connectionStatus === "interested"
                                    ? "bg-gray-200 dark:bg-neutral-800 text-gray-500 cursor-default"
                                    : connectionStatus === "following"
                                        ? "bg-green-600 text-white cursor-default"
                                        : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                                }`}
                        >
                            {connectionStatus === "interested"
                                ? "Requested"
                                : connectionStatus === "following"
                                    ? "Connected"
                                    : "Follow"
                            }
                        </button>

                        <button
                            onClick={() => navigate(`/chat/${user.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-center shadow-md dark:shadow-none w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} />
                            <span>Chat</span>
                        </button>

                        <button
                            onClick={() => setShowExpertiseModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-center shadow-md dark:shadow-none w-full sm:w-auto"
                        >
                            View Expertise
                        </button>
                    </div>
                </div>

                {/* POSTS GRID */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                        Posts
                    </h2>

                    {!loadingPosts && posts.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
                    )}

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {posts.map((post) => (
                            <Link
                                to={`/post/${post.id}`}
                                key={post.id}
                                className="bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex items-center justify-center h-40 sm:h-48 hover:opacity-90 transition"
                            >
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="User Post"
                                        className="object-cover w-full h-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>



            {/* View Expertise Modal */}
            {showExpertiseModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowExpertiseModal(false)}
                >
                    <div
                        className="bg-white dark:bg-[#111] w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowExpertiseModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">User Expertise</h2>

                        {user.expertise ? (
                            <div className="mt-4 max-h-[80vh] overflow-y-auto">
                                <MyExperties expertise={user.expertise} />
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400">This user hasn't added any expertise yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SNACKBAR */}
            {snack && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100]
                                px-6 py-3 bg-black/90 text-white text-sm font-medium
                                rounded-full shadow-2xl animate-fadeIn pointer-events-none whitespace-nowrap">
                    {snack}
                </div>
            )}
        </div>
    );
}
