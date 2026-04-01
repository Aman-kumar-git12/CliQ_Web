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
import { createPortal } from "react-dom";

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

        // GLOBAL BLUR SYNC
        const rootElement = document.getElementById("root");
        if (rootElement) {
            if (isModalOpen) {
                rootElement.classList.add("global-modal-blur");
            } else {
                rootElement.classList.remove("global-modal-blur");
            }
        }

        return () => {
            document.body.style.overflow = "unset";
            if (rootElement) rootElement.classList.remove("global-modal-blur");
        };
    }, [showExpertiseModal, showImageViewer, showLogoutPopup, showUploadConfirm]);

    if (loading) return <ProfileShimmering />;
    if (!user) return <div className="text-center text-white mt-10 font-bold">No user found</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-transparent text-white relative overflow-x-hidden no-scrollbar transition-all duration-500">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ec4899]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="w-full max-w-2xl mx-auto pt-24 md:pt-6 px-4 pb-20 relative z-10 transition-all duration-500">

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

                <div className="px-4 sm:px-10 mt-6 md:mt-8 transition-all duration-500">
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
                <div className="mt-4 min-h-[600px] px-2 md:px-4">
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
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-wider">
                                            My Posts
                                            <span className="text-[10px] font-black text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 not-italic tracking-widest">{posts.length}</span>
                                        </h2>
                                    </div>

                                    {!loadingPosts && posts.length === 0 && (
                                        <div className="text-center py-20 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 mx-2">
                                            <p className="text-white/30 font-black uppercase tracking-widest italic">No posts yet</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-1 md:gap-4 transition-all duration-500">
                                        {posts.map((post) => (
                                            <Link
                                                to={`/post/${post.id}`}
                                                key={post.id}
                                                className="group relative aspect-square bg-white/[0.03] backdrop-blur-xl rounded-[16px] md:rounded-[28px] overflow-hidden border border-white/10 shadow-lg hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 active:scale-95"
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
                                                        <div className="absolute inset-0 bg-white/0 pointer-events-none" />
                                                        <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg pointer-events-none">
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
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-wider">
                                            Groups
                                            <span className="text-[10px] font-black text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 not-italic tracking-widest">0</span>
                                        </h2>
                                    </div>
                                    <div className="text-center py-20 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col items-center justify-center gap-6 mx-2 group cursor-pointer hover:bg-white/[0.06] transition-all duration-500">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:bg-white/10 transition-all border border-white/5">
                                            <Plus size={32} />
                                        </div>
                                        <p className="text-white/30 font-black uppercase tracking-widest italic group-hover:text-white/50 transition-colors">Start a Group</p>
                                    </div>
                                </>
                            )}

                            {activeTab === "expertise" && (
                                <>
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-wider">My Expertise</h2>
                                        <button
                                            onClick={() => setShowExpertiseModal(true)}
                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all border border-white/20"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden relative group transition-all duration-500">
                                        {/* Subtle Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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

            {createPortal(
                <AnimatePresence>
                    {showImageViewer && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                                onClick={() => setShowImageViewer(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative z-10 max-w-full max-h-[90vh] flex flex-col items-center gap-6"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowImageViewer(false)}
                                    className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={32} />
                                </button>
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {showExpertiseModal && (
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setShowExpertiseModal(false)}
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-black/90 w-full md:max-w-5xl rounded-[40px] p-6 md:p-10 border border-white/20 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Glows */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ec4899]/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">User Expertise</h2>
                                    <button onClick={() => setShowExpertiseModal(false)} className="bg-white/5 p-3 rounded-full text-white/40 hover:text-white transition-all border border-white/10 active:scale-90">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="max-h-[75vh] md:max-h-[85vh] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                    <MyExperties expertise={user.expertise} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
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
