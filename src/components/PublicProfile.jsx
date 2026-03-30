import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import MyExperties from "./MyExperties/MyExperties";
import { X, Plus, Eye, Play } from "lucide-react";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import { useUserContext } from "../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import ProfileShimmering from "./shimmering/ProfileShimmering";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import { Link } from "react-router-dom";

const TABS = ["posts", "connections", "groups", "expertise"];

const PublicProfile = () => {
    const { userId: userIdFromUrl } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { user: currentUser } = useUserContext();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [connections, setConnections] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [snack, setSnack] = useState("");

    const [activeTab, setActiveTab] = useState("posts");
    const [direction, setDirection] = useState(1);

    // Hover card state
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimerRef = useRef(null);

    const handleProfileMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverAnchorRect(rect);
        hoverTimerRef.current = setTimeout(() => {
            setShowHoverCard(true);
        }, 500);
    };

    const handleProfileMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, 300);
    };

    const handleCardMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setShowHoverCard(true);
    };

    const handleCardMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, 300);
    };

    const [connectionStatus, setConnectionStatus] = useState(() => {
        return localStorage.getItem(`connection_status_${userIdFromUrl}`) || "none";
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosClient.get(`/user/${userIdFromUrl}`);
                setUser(res.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userIdFromUrl]);

    useEffect(() => {
        if (!user) return;

        const fetchPosts = async () => {
            try {
                const res = await axiosClient.get(`/user/posts/${user.id}`);
                setPosts(res.data || []);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoadingPosts(false);
            }
        };

        const fetchConnections = async () => {
            try {
                const res = await axiosClient.get(`/user/public/connections/${user.id}`);
                setConnections(res.data.connections || []);
            } catch (error) {
                console.error("Error fetching connections:", error);
            } finally {
                setLoadingConnections(false);
            }
        };

        const fetchGroups = async () => {
            try {
                const res = await axiosClient.get(`/chat/public/groups/${user.id}`);
                setGroups(res.data.groups || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchPosts();
        fetchConnections();
        fetchGroups();
    }, [user]);

    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;
        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    const tabVariants = {
        initial: (direction) => ({
            x: direction > 0 ? 30 : -30,
            opacity: 0,
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.25, ease: "easeOut" }
        },
        exit: (direction) => ({
            x: direction > 0 ? -30 : 30,
            opacity: 0,
            transition: { duration: 0.25, ease: "easeOut" }
        })
    };

    const handleFollow = async () => {
        try {
            await axiosClient.post(`/request/send/interested/${user.id}`);
            setConnectionStatus("interested");
            localStorage.setItem(`connection_status_${userIdFromUrl}`, "interested");
            showSnack("Request sent successfully");
        } catch (error) {
            console.error("Follow failed:", error);
            if (error.response && error.response.status === 409) {
                const existing = error.response.data.existing;
                if (existing) {
                    if (existing.status === "ignored") {
                        try {
                            await axiosClient.delete(`/user/connections/cancel/${user.id}`);
                            await axiosClient.post(`/request/send/interested/${user.id}`);
                            setConnectionStatus("interested");
                            localStorage.setItem(`connection_status_${userIdFromUrl}`, "interested");
                            showSnack("Request sent successfully");
                        } catch (retryError) {
                            showSnack("Failed to send request");
                        }
                    } else if (existing.status === "interested") {
                        setConnectionStatus("interested");
                        localStorage.setItem(`connection_status_${userIdFromUrl}`, "interested");
                        showSnack("Request already sent");
                    } else if (existing.status === "accepted") {
                        setConnectionStatus("following");
                        localStorage.setItem(`connection_status_${userIdFromUrl}`, "following");
                        showSnack("You are already following this user");
                    }
                }
            } else {
                showSnack("Failed to send request");
            }
        }
    };

    if (loading) return <ProfileShimmering />;
    if (!user) return <div className="text-center text-white mt-10 font-bold">User not found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-900/10 dark:bg-neutral-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl mx-auto pt-6 px-4 pb-20 relative z-10 transition-all duration-500">
                
                <ProfileHeader 
                    user={user}
                    isOwnProfile={false}
                    onBack={() => navigate(-1)}
                    connectionStatus={connectionStatus}
                    onConnect={handleFollow}
                    onChat={() => navigate(`/messages/${user.id}`)}
                    onAvatarMouseEnter={handleProfileMouseEnter}
                    onAvatarMouseLeave={handleProfileMouseLeave}
                />

                <div className="px-6 sm:px-10 mt-6">
                    <ProfileStats 
                        stats={{
                            posts: user.postsCount || posts.length,
                            connections: user.connectionsCount || connections.length,
                            groups: user.groupsCount || groups.length
                        }}
                    />

                    <ProfileTabs 
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                </div>

                {/* TAB CONTENT SECTION */}
                <div className="mt-8 min-h-[400px] px-4">
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={tabVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                            className="w-full"
                        >
                            {activeTab === "posts" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            Recent Posts
                                            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                                        </h2>
                                    </div>

                                    {!loadingPosts && posts.length === 0 ? (
                                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-700">
                                            <p className="text-gray-400">This user hasn't posted anything yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                            {posts.map((post) => (
                                                <Link
                                                    to={`/post/${post.id}`}
                                                    key={post.id}
                                                    className="group relative aspect-square bg-[#111] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                                >
                                                    {post.video ? (
                                                        <>
                                                            <video
                                                                src={post.video}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                muted
                                                                playsInline
                                                                preload="metadata"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                                                            <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/65 border border-white/10 flex items-center justify-center text-white shadow-lg pointer-events-none">
                                                                <Play size={16} fill="currentColor" />
                                                            </div>
                                                        </>
                                                    ) : post.image ? (
                                                        <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center text-sm">
                                                            <p className="line-clamp-3 italic opacity-60">"{post.content}"</p>
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "connections" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            Network
                                            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{connections.length}</span>
                                        </h2>
                                    </div>
                                    {loadingConnections ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : connections.length === 0 ? (
                                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-700">
                                            <p className="text-gray-400 text-sm">No public connections found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {connections.map((conn) => (
                                                <Link
                                                    to={conn.id === currentUser?.id ? "/profile" : `/user/${conn.id}`}
                                                    key={conn.id}
                                                    className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img src={conn.imageUrl || "https://github.com/shadcn.png"} alt={conn.firstname} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-lg" />
                                                        <div className="flex flex-col">
                                                            <h3 className="text-sm font-bold text-white">
                                                                {conn.firstname} {conn.lastname}
                                                            </h3>
                                                            <p className="text-xs text-gray-400">
                                                                @{conn.username || `${conn.firstname.toLowerCase()}_${conn.lastname.toLowerCase()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "groups" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            Groups
                                            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{groups.length}</span>
                                        </h2>
                                    </div>
                                    {loadingGroups ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-700 flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                                                <Plus size={24} />
                                            </div>
                                            <p className="text-gray-400 text-sm">No public groups found.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {groups.map((group) => (
                                                <div key={group.id} className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/10">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 overflow-hidden">
                                                        {group.image ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" /> : group.name?.charAt(0) || "G"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm text-white truncate">{group.name || "Unnamed Group"}</h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">{group.participantIds?.length || 0} Members</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "expertise" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Professional Stack</h2>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-500">
                                        {user.expertise ? (
                                            <MyExperties expertise={user.expertise} />
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 text-sm font-bold">This user hasn't added any expertise yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <ProfileHoverCard
                userId={user?.id}
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
            />

            {snack && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl pointer-events-none whitespace-nowrap"
                    >
                        {snack}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default PublicProfile;
