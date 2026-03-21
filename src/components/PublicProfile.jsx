import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import MyExperties from "./MyExperties/MyExperties";
import { X, ArrowLeft, MessageSquare, Heart, ChevronRight, Share2, MoreVertical, ShieldCheck, Mail, MapPin, Calendar, Globe, Award, Sparkles } from "lucide-react";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import { useUserContext } from "../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import ProfileShimmering from "./shimmering/ProfileShimmering";

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
                setPosts(res.data.posts || []);
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

    const scrollToSection = (tabName) => {
        handleTabChange(tabName);
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

    const handleButtonClick = () => {
        if (connectionStatus === "none" || connectionStatus === "ignored") {
            handleFollow();
        }
    };

    if (loading) return <ProfileShimmering />;
    if (!user) return <div className="text-center text-white mt-10 font-bold">User not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-800/10 dark:bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/5 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto pt-4 px-4 pb-20 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex md:hidden items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-4 transition-colors p-2 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full w-fit group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back</span>
                </button>

                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-6 flex justify-end relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                    </div>

                    <div className="px-6 sm:px-10 pb-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-8 gap-6">
                            <div
                                className="relative group cursor-pointer"
                                onMouseEnter={handleProfileMouseEnter}
                                onMouseLeave={handleProfileMouseLeave}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
                                <img
                                    src={user.imageUrl || "https://github.com/shadcn.png"}
                                    alt="User"
                                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#111] shadow-2xl"
                                />
                            </div>

                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                                    {user.firstname} {user.lastname}
                                    <ShieldCheck className="text-blue-500" size={20} />
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">@{user.username || `${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                            {[
                                { label: "Posts", val: user.postsCount || posts.length, color: "blue", tab: "posts" },
                                { label: "Connections", val: user.connectionsCount || connections.length, color: "green", tab: "connections" },
                                { label: "Groups", val: user.groupsCount || groups.length, color: "purple", tab: "groups" }
                            ].map(stat => (
                                <div 
                                    key={stat.label}
                                    onClick={() => scrollToSection(stat.tab)}
                                    className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all group/stat"
                                >
                                    <span className={`text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1 group-hover/stat:text-${stat.color}-500 transition-colors`}>{stat.label}</span>
                                    <span className="text-xl font-black dark:text-gray-200 group-hover/stat:scale-110 transition-transform">{stat.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200 ${connectionStatus === "following" ? "bg-green-500" :
                                    connectionStatus === "interested" ? "bg-gray-500" :
                                        "bg-gradient-to-r from-blue-600 to-indigo-600"
                                    }`}></div>
                                <button
                                    onClick={handleButtonClick}
                                    disabled={connectionStatus === "following" || connectionStatus === "interested"}
                                    className={`relative w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2
                                        ${connectionStatus === "interested"
                                            ? "bg-neutral-800 text-gray-500 cursor-default"
                                            : connectionStatus === "following"
                                                ? "bg-green-600 text-white cursor-default"
                                                : "bg-white text-black hover:bg-neutral-100 active:scale-95"
                                        }`}
                                >
                                    {connectionStatus === "interested" ? "Request Sent" :
                                        connectionStatus === "following" ? "Connected" : "Connect"}
                                </button>
                            </div>

                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <button
                                    onClick={() => navigate(`/messages/${user.id}`)}
                                    className="relative w-full bg-black dark:bg-white text-white dark:text-black rounded-xl py-3.5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    <MessageSquare size={16} /> Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STICKY TAB BAR */}
                <div className="sticky top-0 z-50 -mx-4 px-4 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/10 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center justify-center gap-1 py-4 max-w-4xl mx-auto">
                        {TABS.map((tab, idx) => (
                            <React.Fragment key={tab}>
                                <button
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab 
                                        ? "bg-black dark:bg-white text-white dark:text-black shadow-xl scale-105" 
                                        : "text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"}`}
                                >
                                    {tab}
                                </button>
                                {idx !== TABS.length - 1 && <div className="w-[3px] h-[3px] rounded-full bg-gray-200 dark:bg-white/20 mx-2 shrink-0"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="min-h-[400px]">
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
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-2">
                                            Recent Posts
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                                        </h2>
                                    </div>
                                    {!loadingPosts && posts.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">This user hasn't posted anything yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {posts.map((post) => (
                                                <Link
                                                    to={`/post/${post.id}`}
                                                    key={post.id}
                                                    className="group relative aspect-square bg-gray-100 dark:bg-[#111] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                                                >
                                                    {post.image ? (
                                                        <>
                                                            <img src={post.image} alt="Post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                                                                    <Share2 size={20} />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center text-xs bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#111] dark:to-[#1a1a1a]">
                                                            <p className="line-clamp-4 leading-relaxed font-bold italic">"{post.content}"</p>
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
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-2">
                                            Network
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{connections.length}</span>
                                        </h2>
                                    </div>
                                    {loadingConnections ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-20 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : connections.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">No public connections found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {connections.map((conn) => (
                                                <Link
                                                    to={conn.id === currentUser?.id ? "/profile" : `/user/${conn.id}`}
                                                    key={conn.id}
                                                    className="group relative flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl transition-all duration-500 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:-translate-y-0.5"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="relative shrink-0">
                                                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
                                                            <img src={conn.imageUrl || "https://github.com/shadcn.png"} alt={conn.firstname} className="relative w-12 h-12 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-lg" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h3 className="text-sm font-black text-black dark:text-white truncate uppercase tracking-tighter">
                                                                {conn.firstname} {conn.lastname}
                                                            </h3>
                                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">
                                                                {conn.expertise?.skills?.[0] || "Network Innovator"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-lg opacity-0 group-hover:opacity-100">
                                                        View Profile
                                                    </button>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "groups" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-2">
                                            Communnities
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{groups.length}</span>
                                        </h2>
                                    </div>
                                    {loadingGroups ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">No public groups found.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {groups.map((group) => (
                                                <div key={group.id} className="group relative flex items-center gap-4 p-5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl transition-all duration-500 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 overflow-hidden">
                                                        {group.image ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" /> : group.name?.charAt(0) || "G"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-black text-xs text-black dark:text-white truncate uppercase tracking-tighter">{group.name || "Unnamed Group"}</h3>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{group.participantIds?.length || 0} Members</p>
                                                    </div>
                                                    <button className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-lg">Join</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "expertise" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Professional Stack</h2>
                                    </div>
                                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 transition-all duration-500">
                                        {user.expertise ? (
                                            <MyExperties expertise={user.expertise} />
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">This user hasn't added any expertise yet.</p>
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
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl animate-pulse pointer-events-none whitespace-nowrap"
                    >
                        {snack}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default PublicProfile;
