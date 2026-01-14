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
        <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients (Subtle Dark Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto pt-4 px-4 pb-20 relative z-10">

                {/* BACK BUTTON - Hidden on Desktop */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex md:hidden items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-4 transition-colors p-2 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full w-fit"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                {/* GLASSMORPHIC PROFILE CARD */}
                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden">

                    {/* Header Banner / Gradient Top */}
                    <div className="h-32 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-6 flex justify-end relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                    </div>

                    <div className="px-6 sm:px-10 pb-10">
                        {/* AVATAR & INFO HEADER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-8 gap-6">

                            {/* Avatar Wrapper */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/40 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                                <img
                                    src={user.imageUrl || "https://github.com/shadcn.png"}
                                    alt="User"
                                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#111] shadow-2xl"
                                />
                            </div>

                            {/* User Name & Handle */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">
                                    {user.firstname} {user.lastname}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">@{user.username || `${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}</p>
                            </div>
                        </div>

                        {/* STATS ROW (Grid Layout) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                            {user.age && (
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Age</span>
                                    <span className="text-xl font-bold dark:text-gray-200">{user.age}</span>
                                </div>
                            )}
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Posts</span>
                                <span className="text-xl font-bold dark:text-gray-200">{posts.length}</span>
                            </div>
                            <div className={`bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center ${user.age ? 'sm:col-span-2' : 'col-span-2 sm:col-span-3'}`}>
                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Joined</span>
                                <span className="text-lg font-bold dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">

                            {/* Follow Button */}
                            <div className="relative flex-1 group">
                                <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200 ${connectionStatus === "following" ? "bg-green-500" :
                                        connectionStatus === "interested" ? "bg-gray-500" :
                                            "bg-gradient-to-r from-blue-600 to-indigo-600"
                                    }`}></div>
                                <button
                                    onClick={handleButtonClick}
                                    disabled={connectionStatus === "following" || connectionStatus === "interested"}
                                    className={`relative w-full py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                                        ${connectionStatus === "interested"
                                            ? "bg-neutral-800 text-gray-400 cursor-default"
                                            : connectionStatus === "following"
                                                ? "bg-green-600 text-white cursor-default"
                                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25"
                                        }`}
                                >
                                    {connectionStatus === "interested" ? "Request Sent" :
                                        connectionStatus === "following" ? "Connected" : "Connect"}
                                </button>
                            </div>

                            {/* Chat Button */}
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    onClick={() => navigate(`/chat/${user.id}`)}
                                    className="relative w-full bg-black dark:bg-[#0a0a0a] text-white border border-gray-800 rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all"
                                >
                                    <MessageSquare size={18} /> Chat
                                </button>
                            </div>

                            {/* Expertise Button */}
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    onClick={() => setShowExpertiseModal(true)}
                                    className="relative w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-orange-500/25 transition-all"
                                >
                                    Expertise
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* POSTS SECTION */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                            Posts
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                        </h2>
                    </div>

                    {!loadingPosts && posts.length === 0 && (
                        <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">This user hasn't posted anything yet.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {posts.map((post) => (
                            <Link
                                to={`/post/${post.id}`}
                                key={post.id}
                                className="group relative aspect-square bg-gray-100 dark:bg-[#111] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {post.image ? (
                                    <>
                                        <img
                                            src={post.image}
                                            alt="Post"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center text-sm">
                                        <p className="line-clamp-3">{post.content}</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>

            {/* View Expertise Modal */}
            {showExpertiseModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowExpertiseModal(false)}
                >
                    <div
                        className="bg-white dark:bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Gradient Blob */}
                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-3xl font-bold text-black dark:text-white">User Expertise</h2>
                            <button
                                onClick={() => setShowExpertiseModal(false)}
                                className="bg-gray-100 dark:bg-white/5 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative z-10">
                            {user.expertise ? (
                                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <MyExperties expertise={user.expertise} />
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                    <p className="text-gray-500 dark:text-gray-400">This user hasn't added any expertise yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SNACKBAR */}
            {snack && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]
                                px-6 py-3 bg-white dark:bg-[#222] text-black dark:text-white text-sm font-medium
                                rounded-full shadow-2xl border border-gray-200 dark:border-gray-800 animate-fadeIn pointer-events-none whitespace-nowrap">
                    {snack}
                </div>
            )}
        </div>
    );
}
