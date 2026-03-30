import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate, useParams } from "react-router-dom";
import LogoutConfirmation from "./Confirmation";
import MyExperties from "./MyExperties/MyExperties";
import { Plus, Eye, X, Play } from "lucide-react";
import { useUserContext } from "../context/userContext";
import ProfileShimmering from "./shimmering/ProfileShimmering";
import { motion, AnimatePresence } from "framer-motion";
import ProfileConnections from "./Connections/ProfileConnections";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";

const TABS = ["posts", "connections", "groups", "expertise"];

export default function ProfilePage() {
    const { customTab } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { setUser: setGlobalUser } = useUserContext(); 
    const containerRef = useRef(null); 

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
    const [hoverUserId, setHoverUserId] = useState(null);

    const handleProfileMouseEnter = (e, userId) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect();

        hoverTimeoutRef.current = setTimeout(() => {
            setHoverUserId(userId);
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
            setGlobalUser(null);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setShowUploadConfirm(true);
        }
    };

    const handleUploadImage = async () => {
        if (!selectedFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const res = await axiosClient.put("/profile/image", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
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

    const handleImageOptionClick = (option) => {
        if (option === 'view') {
            setShowImageMenu(false);
            setShowImageViewer(true);
        } else if (option === 'upload') {
            setShowImageMenu(false);
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const isModalOpen = showExpertiseModal || showImageViewer || showLogoutPopup || showUploadConfirm;
        document.body.style.overflow = isModalOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showExpertiseModal, showImageViewer, showLogoutPopup, showUploadConfirm]);

    if (loading) return <ProfileShimmering />;
    if (!user) return <div className="text-center text-white mt-10 font-bold">No user found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl mx-auto pt-6 px-4 pb-20 relative z-10 transition-all duration-500">
                
                <ProfileHeader 
                    user={user}
                    isOwnProfile={true}
                    onEditProfile={() => navigate("/edit-profile")}
                    onImageClick={() => setShowImageMenu(!showImageMenu)}
                    onImageOptionClick={handleImageOptionClick}
                    showImageMenu={showImageMenu}
                    onAvatarMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                    onAvatarMouseLeave={handleProfileMouseLeave}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />

                <div className="px-6 sm:px-10 mt-6">
                    <ProfileStats 
                        stats={{
                            posts: user.postsCount || posts.length,
                            connections: user.connectionsCount || "0",
                            groups: user.groupsCount || "0"
                        }}
                    />

                    <ProfileTabs 
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                </div>

                {/* TAB CONTENT SECTION */}
                <div className="mt-8 min-h-[600px] px-4">
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
                                </>
                            )}

                            {activeTab === "connections" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">Connections</h2>
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
                                        <p className="text-gray-400 font-medium">No groups found</p>
                                    </div>
                                </>
                            )}

                            {activeTab === "expertise" && (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">My Expertise</h2>
                                        <button
                                            onClick={() => setShowExpertiseModal(true)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400"
                                        >
                                            <Eye size={20} />
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
            />

            {showImageViewer && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setShowImageViewer(false)}
                >
                    <button className="absolute top-4 right-4 text-white p-2">
                        <X size={32} />
                    </button>
                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                    />
                </div>
            )}

            {showExpertiseModal && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowExpertiseModal(false)}
                >
                    <div className="bg-[#0f0f0f] w-full max-w-2xl rounded-3xl p-8 border border-white/10 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-white">User Expertise</h2>
                            <button onClick={() => setShowExpertiseModal(false)} className="bg-white/5 p-2 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                            <MyExperties expertise={user.expertise} />
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
        </div>
    );
}
