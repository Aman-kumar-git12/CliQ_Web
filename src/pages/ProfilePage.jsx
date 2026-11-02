import { useEffect, useState, useRef } from "react";
import * as postsApi from "../api/posts";
import * as usersApi from "../api/users";
import { useParams } from "react-router-dom";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ExpertiseView from "../components/expertise/ExpertiseView";
import { Plus, Eye } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import ProfileShimmering from "../components/shimmering/ProfileShimmering";
import { motion, AnimatePresence } from "framer-motion";
import ProfileConnections from "../components/connections/ProfileConnections";
import ProfileHoverCard from "../components/profile/ProfileHoverCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileTabs from "../components/profile/ProfileTabs";
import { showErrorToast } from "../utils/toast";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useProfileHoverCard } from "../hooks/useProfileHoverCard";
import OwnProfilePostsTab from "../components/profile/OwnProfilePostsTab";
import ProfilePhotoViewer from "../components/profile/ProfilePhotoViewer";
import ProfileExpertiseModal from "../components/profile/ProfileExpertiseModal";

const TABS = ["posts", "connections", "groups", "expertise"];

export default function ProfilePage() {
    const { customTab } = useParams();
    const fileInputRef = useRef(null);
    const { logout, user: currentUser, setUser: setGlobalUser } = useUserContext();
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
    const {
        showHoverCard,
        hoverAnchorRect,
        handleProfileMouseEnter,
        handleProfileMouseLeave,
        handleCardMouseEnter,
        handleCardMouseLeave,
    } = useProfileHoverCard(containerRef);

    // Sync if URL changes externally
    useEffect(() => {
        const urlTab =
            customTab === "connection=True"
                ? "connections"
                : customTab === "group=True"
                  ? "groups"
                  : customTab === "expertise=True"
                    ? "expertise"
                    : "posts";

        if (urlTab !== activeTab) {
            const currentIndex = TABS.indexOf(activeTab);
            const newIndex = TABS.indexOf(urlTab);
            setDirection(newIndex > currentIndex ? 1 : -1);
            setActiveTab(urlTab);
        }
        // Only the URL drives this; activeTab is read just to pick the slide direction
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            transition: { duration: 0.25, ease: "easeOut" },
        },
        exit: (direction) => ({
            x: direction > 0 ? -30 : 30,
            opacity: 0,
            transition: { duration: 0.25, ease: "easeOut" },
        }),
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await usersApi.getMyProfile();
                setUser(data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // The logged-in user's id is already known, so the posts load alongside the profile instead of after it
    const profileUserId = currentUser?.id;

    useEffect(() => {
        if (!profileUserId) return undefined;
        const controller = new AbortController(); // a late response for an older load is dropped

        const fetchPosts = async () => {
            try {
                const data = await postsApi.getUserPosts(profileUserId, { signal: controller.signal });
                setPosts(Array.isArray(data) ? data : []);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Error fetching posts:", error);
            }
            setLoadingPosts(false);
        };
        fetchPosts();
        return () => controller.abort();
    }, [profileUserId]);

    const handleLogout = async () => {
        await logout();
        setUser(null);
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
            const data = await usersApi.updateProfileImage(formData, { silent: true });
            // The server answers { message, imageUrl }; the sidebar and composer read the photo from UserContext
            if (data?.imageUrl) {
                setUser((prev) => ({ ...prev, imageUrl: data.imageUrl }));
                setGlobalUser((prev) => (prev ? { ...prev, imageUrl: data.imageUrl } : prev));
            }
            setShowUploadConfirm(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            showErrorToast(error.response?.data?.message || "Failed to upload image");
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
        if (option === "view") {
            setShowImageMenu(false);
            setShowImageViewer(true);
        } else if (option === "upload") {
            setShowImageMenu(false);
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEscapeKey(showImageViewer, () => setShowImageViewer(false));
    useEscapeKey(showExpertiseModal, () => setShowExpertiseModal(false));

    const isModalOpen = showExpertiseModal || showImageViewer || showLogoutPopup || showUploadConfirm;
    useBodyScrollLock(isModalOpen);

    useEffect(() => {
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
            if (rootElement) rootElement.classList.remove("global-modal-blur");
        };
    }, [isModalOpen]);

    if (loading) return <ProfileShimmering />;
    if (!user) return <div className="text-center text-white mt-10 font-bold">No user found</div>;

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-transparent text-white relative overflow-x-hidden no-scrollbar transition-all duration-500"
        >
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-pink/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="w-full max-w-2xl mx-auto pt-24 md:pt-6 px-4 pb-20 relative z-10 transition-all duration-500">
                <ProfileHeader
                    user={user}
                    isOwnProfile={true}
                    onImageClick={() => setShowImageMenu(!showImageMenu)}
                    onImageOptionClick={handleImageOptionClick}
                    showImageMenu={showImageMenu}
                    onAvatarMouseEnter={(e) => handleProfileMouseEnter(e)}
                    onAvatarMouseLeave={handleProfileMouseLeave}
                />

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                <div className="px-4 sm:px-10 mt-6 md:mt-8 transition-all duration-500">
                    <ProfileStats
                        stats={{
                            posts: user.postsCount || posts.length,
                            connections: user.connectionsCount || "0",
                            groups: user.groupsCount || "0",
                        }}
                    />

                    <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
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
                                <OwnProfilePostsTab user={user} posts={posts} loadingPosts={loadingPosts} />
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
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-wider">
                                            Groups
                                            <span className="text-[10px] font-black text-white/30 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 not-italic tracking-widest">
                                                0
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="text-center py-20 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col items-center justify-center gap-6 mx-2 group cursor-pointer hover:bg-white/[0.06] transition-all duration-500">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:bg-white/10 transition-all border border-white/5">
                                            <Plus size={32} />
                                        </div>
                                        <p className="text-white/30 font-black uppercase tracking-widest italic group-hover:text-white/50 transition-colors">
                                            Start a Group
                                        </p>
                                    </div>
                                </>
                            )}

                            {activeTab === "expertise" && (
                                <>
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-wider">
                                            My Expertise
                                        </h2>
                                        <button
                                            type="button"
                                            aria-label="View expertise in full screen"
                                            onClick={() => setShowExpertiseModal(true)}
                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all border border-white/20"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden relative group transition-all duration-500">
                                        {/* Subtle Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        <ExpertiseView expertise={user.expertise} />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* MODALS */}
            <ConfirmDialog
                isOpen={showLogoutPopup}
                onClose={() => setShowLogoutPopup(false)}
                onConfirm={handleLogout}
                title="Are you sure you want to logout?"
                confirmText="Yes, Logout"
            />

            <ConfirmDialog
                isOpen={showUploadConfirm}
                onClose={cancelUpload}
                onConfirm={handleUploadImage}
                title="Update Profile Photo"
                message="Looks good! Want to set this as your new profile picture?"
                confirmText={uploading ? "Uploading..." : "Update"}
            />

            <ProfilePhotoViewer isOpen={showImageViewer} user={user} onClose={() => setShowImageViewer(false)} />

            <ProfileExpertiseModal
                isOpen={showExpertiseModal}
                expertise={user.expertise}
                onClose={() => setShowExpertiseModal(false)}
            />

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
