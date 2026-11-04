import { useEffect, useState, useRef } from "react";
import * as postsApi from "../api/posts";
import * as usersApi from "../api/users";
import { useParams } from "react-router-dom";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ExpertiseView from "../components/expertise/ExpertiseView";
import { Eye, Layers, UserX, Users } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import ProfileShimmering from "../components/shimmering/ProfileShimmering";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_SOFT } from "../components/common/motionPresets";
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
import { ProfileEmptyAction, ProfileEmptyState, ProfileSectionHeading } from "../components/profile/ProfileSection";

const TABS = ["posts", "connections", "groups", "expertise"];

export default function ProfilePage() {
    const { customTab } = useParams();
    const fileInputRef = useRef(null);
    const { user: currentUser, setUser: setGlobalUser } = useUserContext();
    const containerRef = useRef(null);
    const tabContentRef = useRef(null);

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);

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

    // A stat card opens its tab and brings the tab content into view (scroll-mt keeps it clear of the sticky tabs)
    const handleStatClick = (id) => {
        handleTabChange(id);
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        tabContentRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    const tabVariants = {
        initial: (direction) => ({
            x: direction > 0 ? 16 : -16,
            opacity: 0,
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.24, ease: EASE_SOFT },
        },
        exit: (direction) => ({
            x: direction > 0 ? -16 : 16,
            opacity: 0,
            transition: { duration: 0.15, ease: "easeOut" },
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

    const isModalOpen = showExpertiseModal || showImageViewer || showUploadConfirm;
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
    if (!user) {
        return (
            <div className="w-full max-w-md mx-auto px-4 pt-28 md:pt-16">
                <ProfileEmptyState
                    icon={UserX}
                    title="No user found"
                    hint="We couldn't load your profile. Please try again in a moment."
                    action={<ProfileEmptyAction to="/">Back home</ProfileEmptyAction>}
                />
            </div>
        );
    }

    const hasExpertise = Boolean(user.expertise) && Object.keys(user.expertise).length > 0;

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-transparent text-white relative overflow-x-hidden no-scrollbar"
        >
            {/* Background glows, kept faint so the page reads calm */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/[0.07] rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-pink/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="w-full max-w-2xl mx-auto pt-24 md:pt-6 pb-20 relative z-10">
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

                {/* Same horizontal rhythm as PublicProfilePage: px-4 on mobile, flush with the header on desktop */}
                <div className="px-4 md:px-0 mt-5 md:mt-6">
                    <ProfileStats
                        stats={{
                            posts: user.postsCount || posts.length,
                            connections: user.connectionsCount || "0",
                            groups: user.groupsCount || "0",
                        }}
                        onStatClick={handleStatClick}
                    />

                    <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
                </div>

                {/* TAB CONTENT SECTION */}
                <div
                    ref={tabContentRef}
                    className="relative mt-4 md:mt-6 min-h-[600px] px-4 md:px-0 scroll-mt-32 md:scroll-mt-24"
                >
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={tabVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            {activeTab === "posts" && (
                                <OwnProfilePostsTab user={user} posts={posts} loadingPosts={loadingPosts} />
                            )}

                            {activeTab === "connections" && <ProfileConnections />}

                            {activeTab === "groups" && (
                                <section>
                                    <ProfileSectionHeading title="Groups" />
                                    <ProfileEmptyState
                                        icon={Users}
                                        title="No groups yet"
                                        hint="Groups are coming soon."
                                    />
                                </section>
                            )}

                            {activeTab === "expertise" && (
                                <section>
                                    <ProfileSectionHeading
                                        title="My Expertise"
                                        action={
                                            hasExpertise && (
                                                <button
                                                    type="button"
                                                    aria-label="View expertise in full screen"
                                                    onClick={() => setShowExpertiseModal(true)}
                                                    className="p-2.5 rounded-full bg-white/[0.04] border border-line text-ink-300 hover:bg-white/[0.08] hover:border-line-strong hover:text-white cliq-press focus-ring"
                                                >
                                                    <Eye size={18} aria-hidden="true" />
                                                </button>
                                            )
                                        }
                                    />
                                    {hasExpertise ? (
                                        <div className="rounded-3xl p-5 md:p-8 bg-white/[0.03] border border-line shadow-soft overflow-hidden">
                                            <ExpertiseView expertise={user.expertise} />
                                        </div>
                                    ) : (
                                        <ProfileEmptyState
                                            icon={Layers}
                                            title="No expertise yet"
                                            hint="Show people what you work on, your skills and your projects."
                                            action={
                                                <ProfileEmptyAction to="/my-experties">
                                                    Build your expertise page
                                                </ProfileEmptyAction>
                                            }
                                        />
                                    )}
                                </section>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* MODALS */}
            <ConfirmDialog
                isOpen={showUploadConfirm}
                onClose={cancelUpload}
                onConfirm={handleUploadImage}
                title="Update Profile Photo"
                message="Looks good! Want to set this as your new profile picture?"
                confirmText={uploading ? "Uploading..." : "Update"}
                isLoading={uploading}
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
