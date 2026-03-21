import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate, useParams } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";
import MyExperties from "./MyExperties/MyExperties";
import { Plus, Camera, Eye, Upload, X, UserCog } from "lucide-react";
import { useUserContext } from "../context/userContext";
import ProfileShimmering from "./shimmering/ProfileShimmering";
import { motion, AnimatePresence } from "framer-motion";
import ProfileConnections from "./Connections/ProfileConnections";
import ProfileHoverCard from "./Post/ProfileHoverCard";

const TABS = ["posts", "expertise", "connections", "groups"];

export default function ProfilePage() {
    const { customTab } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { setUser: setGlobalUser, user: currentUser } = useUserContext(); // Added currentUser from context
    const containerRef = useRef(null); // Added containerRef

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    // Upload & View States
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadConfirm, setShowUploadConfirm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);

    // Expertise States
    const [showExpertiseMenu, setShowExpertiseMenu] = useState(false);
    const [showExpertiseModal, setShowExpertiseModal] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState(() => {
        if (customTab === "connection=True") return "connections";
        if (customTab === "group=True") return "groups";
        if (customTab === "expertise=True") return "expertise";
        return "posts";
    });
    const [direction, setDirection] = useState(1);

    // Hover Card State
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimeoutRef = useRef(null);
    const [hoverUserId, setHoverUserId] = useState(null); // Added hoverUserId state

    const handleProfileMouseEnter = (e, userId) => { // Updated signature
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect(); // Added parentRect

        hoverTimeoutRef.current = setTimeout(() => {
            setHoverUserId(userId); // Added setHoverUserId
            setHoverAnchorRect({
                top: rect.top - parentRect.top,
                bottom: rect.bottom - parentRect.top,
                left: rect.left - parentRect.left,
                right: rect.right - parentRect.left,
                width: rect.width,
                height: rect.height
            });
            setShowHoverCard(true);
        }, 500);
    };

    const handleProfileMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, 200);
    };

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handleCardMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowHoverCard(false);
    };

    // Sync if URL changes externally
    useEffect(() => {
        const urlTab = customTab === "connection=True" ? "connections"
            : customTab === "group=True" ? "groups"
                : customTab === "expertise=True" ? "expertise"
                    : "posts";

        if (urlTab !== activeTab) {
            const currentIndex = TABS.indexOf(activeTab);
            const newIndex = TABS.indexOf(urlTab);
            setDirection(newIndex > currentIndex ? 1 : -1);
            setActiveTab(urlTab);
        }
    }, [customTab]);

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;

        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);

        // Silent URL update to prevent Layout.jsx scroll-to-top
        let newUrl = "/profile";
        if (newTab === "connections") newUrl = "/profile/connection=True";
        else if (newTab === "groups") newUrl = "/profile/group=True";
        else if (newTab === "expertise") newUrl = "/profile/expertise=True";

        window.history.replaceState(null, "", newUrl);
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
                const res = await axiosClient.get(`/user/posts/${user.id}`, {
                    withCredentials: true,
                });
                setPosts(Array.isArray(res.data) ? res.data : []);
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
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setGlobalUser(null); // Clear global user state
        }
    };

    const handleEditProfile = () => {
        // Assuming setShowEditConfirm is a state variable that was removed or is not in the provided snippet
        // setShowEditConfirm(false); 
        navigate("/edit-profile");
    };

    // File Selection Handler
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowUploadConfirm(true);
        }
    };

    // Upload Handler
    const handleUploadImage = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            console.log("Uploading image...");
            // Assuming endpoint is /profile/image for image upload
            const res = await axiosClient.put("/profile/image", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res)

            // Update user state with new image
            setUser(prev => ({ ...prev, imageUrl: res.data.imageUrl || res.data.user.imageUrl }));
            setShowUploadConfirm(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const cancelUpload = () => {
        setShowUploadConfirm(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Menu Handlers
    const handleOptionUpload = () => {
        setShowImageMenu(false);
        fileInputRef.current.click();
    };

    const handleOptionView = () => {
        setShowImageMenu(false);
        setShowImageViewer(true);
    };

    if (loading)
        return <ProfileShimmering />;

    if (!user)
        return <div className="text-center text-white mt-10">No user found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative">
            {/* Background Gradients (Subtle Dark Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto pt-6 px-4 pb-20 relative z-10">

                {/* SOLID DARK PROFILE CARD */}
                <div className="bg-[#111111] border border-white/5 shadow-2xl rounded-[28px]">

                    {/* Header Banner / Gradient Top */}
                    <div className="h-[140px] bg-[url('https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=2938&auto=format&fit=crop')] bg-cover bg-center rounded-t-[28px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#111111]/90"></div>
                        <button
                            onClick={() => navigate("/edit-profile")}
                            className="absolute top-5 right-5 bg-black/60 hover:bg-black/80 backdrop-blur-xl text-[#f2f2f7] px-5 py-2.5 rounded-full text-sm font-medium transition-all border border-white/10 flex items-center gap-2 shadow-xl"
                        >
                            <UserCog size={16} /> Edit Profile
                        </button>
                    </div>

                    <div className="px-6 sm:px-10 pb-10">
                        {/* AVATAR & INFO HEADER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-[76px] mb-8 gap-6 relative z-10">

                            {/* Avatar Wrapper */}
                            <div
                                className="relative group/avatar cursor-pointer"
                                onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                onMouseLeave={handleProfileMouseLeave}
                            >
                                <img
                                    src={user.imageUrl || "https://github.com/shadcn.png"}
                                    alt="User"
                                    className="relative w-[150px] h-[150px] rounded-full object-cover border-[6px] border-[#111111] bg-[#111111] shadow-2xl"
                                />
                                {/* Upload Button */}
                                <button
                                    onClick={() => setShowImageMenu(!showImageMenu)}
                                    className="absolute bottom-2 right-2 bg-[#1a1a1a] text-white p-2.5 rounded-full shadow-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors z-20"
                                >
                                    <Camera size={16} />
                                </button>

                                {/* Options Menu */}
                                {showImageMenu && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                                        <button
                                            onClick={handleOptionView}
                                            className="px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Eye size={16} className="text-gray-400" /> View Image
                                        </button>
                                        <button
                                            onClick={handleOptionUpload}
                                            className="px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Upload size={16} className="text-gray-400" /> Upload Image
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* User Name & Handle */}
                            <div className="text-center sm:text-left flex-1 pb-2">
                                <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-1">
                                    {user.firstname} {user.lastname}
                                </h1>
                                <p className="text-[#8e8e93] text-[16px] font-medium mb-3">@{user.firstname?.toLowerCase()}_{user.lastname?.toLowerCase()}</p>
                                <p className="text-[#8e8e93] text-[15px] font-medium flex items-center justify-center sm:justify-start gap-2">
                                    {user.bio || "Builder • Creator • Professional"}
                                </p>
                            </div>
                        </div>

                        {/* STATS ROW (Grid Layout) */}
                        <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide">
                            <div className="bg-[#1a1a1a]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center min-w-[120px] flex-1 sm:flex-none">
                                <span className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-[0.1em] mb-1.5">Posts</span>
                                <span className="text-2xl font-bold tracking-tight text-white">{user.postsCount || posts.length}</span>
                            </div>
                            <div className="bg-[#1a1a1a]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center min-w-[120px] flex-1 sm:flex-none">
                                <span className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-[0.1em] mb-1.5">Connections</span>
                                <span className="text-2xl font-bold tracking-tight text-white">{user.connectionsCount || "0"}</span>
                            </div>
                            <div className="bg-[#1a1a1a]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center min-w-[120px] flex-1 sm:flex-none">
                                <span className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-[0.1em] mb-1.5">Groups</span>
                                <span className="text-2xl font-bold tracking-tight text-white">{user.groupsCount || "0"}</span>
                            </div>
                        </div>

                        {/* STICKY NAVIGATION TABS */}
                        <div className="sticky top-0 z-50 flex justify-center py-4 mb-8">
                            <div className="flex items-center p-1.5 rounded-full border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md max-w-fit mx-auto shadow-sm">
                                {[
                                    { id: "posts", label: "Posts" },
                                    { id: "expertise", label: "Expertise" },
                                    { id: "connections", label: "Connections" },
                                    { id: "groups", label: "Groups" }
                                ].map((tab, idx, arr) => (
                                    <React.Fragment key={tab.id}>
                                        {idx !== 0 && (
                                            <div className={`w-[1px] h-4 mx-1 shrink-0 transition-colors duration-300 ${
                                                activeTab === tab.id || activeTab === arr[idx - 1].id 
                                                ? "bg-transparent" 
                                                : "bg-white/10"
                                            }`}></div>
                                        )}
                                        <button
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`relative px-6 sm:px-8 py-2 rounded-full text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
                                                activeTab === tab.id 
                                                ? "text-white bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.02)]" 
                                                : "text-[#8e8e93] hover:text-gray-200 border border-transparent"
                                            }`}
                                        >
                                            {activeTab === tab.id && (
                                                <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-blue-500/0 via-purple-400 to-indigo-500/0 shadow-[0_0_12px_2px_rgba(168,85,247,0.7)]" />
                                            )}
                                            <span className="relative z-10 tracking-wide">{tab.label}</span>
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="mt-3 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                        </div>
                    </div>
                </div>

                {/* TAB CONTENT SECTION */}
                <div className="mt-8 min-h-[1000px]">
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={tabVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                        >
                            {activeTab === "posts" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            My Posts
                                            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                                        </h2>
                                    </div>

                                    {!loadingPosts && posts.length === 0 && (
                                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-700">
                                            <p className="text-gray-400">You haven't posted anything yet.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                        {posts.map((post) => (
                                            <Link
                                                to={`/post/${post.id}`}
                                                key={post.id}
                                                className="group relative aspect-square bg-[#111] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                            >
                                                {post.image ? (
                                                    <>
                                                        <img
                                                            src={post.image}
                                                            alt="Post"
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/40 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200 pointer-events-none"></div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-center text-sm">
                                                        <p className="line-clamp-3">{post.content}</p>
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeTab === "connections" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            Connections
                                        </h2>
                                    </div>
                                    <ProfileConnections />
                                </>
                            )}

                            {activeTab === "groups" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            Groups
                                            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">0</span>
                                        </h2>
                                    </div>
                                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                                            <Plus size={32} />
                                        </div>
                                        <p className="text-gray-400 font-medium text-lg">No groups found</p>
                                        <p className="text-gray-500 text-sm max-w-[240px]">Join or create a group to start collaborating with others.</p>
                                    </div>
                                </>
                            )}

                            {activeTab === "expertise" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            My Expertise
                                        </h2>
                                        <button
                                            onClick={() => setShowExpertiseModal(true)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all border border-white/10 group"
                                            title="View Full Screen"
                                        >
                                            <Eye size={20} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                        <MyExperties expertise={user.expertise} />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* MODALS */}
            <LogoutConfirmation
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={handleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />



            <LogoutConfirmation
                isOpen={showUploadConfirm}
                onClose={cancelUpload}
                onConfirm={handleUploadImage}
                title="Update Profile Photo"
                message="Looks good! Want to set this as your new profile picture?"
                confirmText={uploading ? "Uploading..." : "Update"}
                confirmColor="bg-pink-600 hover:bg-pink-700"
            />

            {/* Image Viewer */}
            {showImageViewer && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button
                        onClick={() => setShowImageViewer(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* View Expertise Modal (Matches PublicProfile exactly) */}
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
                                <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <MyExperties expertise={user.expertise} />
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                    <p className="text-gray-500 dark:text-gray-400">This user hasn't added any expertise yet.</p>
                                    <button
                                        onClick={() => {
                                            setShowExpertiseModal(false);
                                            navigate("/my-experties");
                                        }}
                                        className="mt-6 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Add Skills
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ProfileHoverCard
                userId={user?.id}
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
            />
        </div >
    );
}
