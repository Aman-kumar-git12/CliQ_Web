import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as chatApi from "../api/chat";
import * as connectionsApi from "../api/connections";
import * as postsApi from "../api/posts";
import * as usersApi from "../api/users";
import ExpertiseView from "../components/expertise/ExpertiseView";
import ProfileHoverCard from "../components/profile/ProfileHoverCard";
import { useUserContext } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_SOFT } from "../components/common/motionPresets";
import { Layers, UserX } from "lucide-react";
import ProfileShimmering from "../components/shimmering/ProfileShimmering";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileTabs from "../components/profile/ProfileTabs";
import PublicProfilePostsTab from "../components/profile/PublicProfilePostsTab";
import PublicProfileConnectionsTab from "../components/profile/PublicProfileConnectionsTab";
import PublicProfileGroupsTab from "../components/profile/PublicProfileGroupsTab";
import { ProfileEmptyAction, ProfileEmptyState, ProfileSectionHeading } from "../components/profile/ProfileSection";
import { invalidateCachedRequests } from "../utils/requestCache";

const TABS = ["posts", "connections", "groups", "expertise"];

const PublicProfileView = () => {
    const { userId: userIdFromUrl } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const tabContentRef = useRef(null);
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
    const snackTimerRef = useRef(null);

    // Pending hover/snackbar timers must not fire after the page unmounts
    useEffect(
        () => () => {
            clearTimeout(hoverTimerRef.current);
            clearTimeout(snackTimerRef.current);
        },
        [],
    );

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

    // "none" | "requested" (I sent) | "incoming" (they sent) | "connected", always read from the server
    const [connectionStatus, setConnectionStatus] = useState("none");

    const loadConnectionStatus = async (isCancelled = () => false) => {
        try {
            const { status, connection } = await connectionsApi.getConnectionStatus(userIdFromUrl);
            if (isCancelled()) return; // the profile changed while this was loading
            if (status === "accepted") setConnectionStatus("connected");
            else if (status === "interested") {
                setConnectionStatus(connection?.fromUserId === currentUser?.id ? "requested" : "incoming");
            } else setConnectionStatus("none");
        } catch (error) {
            if (isCancelled()) return;
            console.error("Error fetching connection status:", error);
        }
    };

    useEffect(() => {
        if (!currentUser?.id) return undefined;
        let cancelled = false; // a late status for the previous profile is ignored
        loadConnectionStatus(() => cancelled);
        return () => {
            cancelled = true;
        };
    }, [userIdFromUrl, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const controller = new AbortController(); // a late response for the previous userId is dropped
        const fetchUser = async () => {
            try {
                const data = await usersApi.getUser(userIdFromUrl, { signal: controller.signal });
                setUser(data.user);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Error fetching user:", error);
            }
            setLoading(false);
        };
        fetchUser();
        return () => controller.abort();
    }, [userIdFromUrl]);

    // The URL already holds the user's id, so posts, connections and groups load alongside the profile
    // instead of waiting for it
    const profileUserId = userIdFromUrl;

    useEffect(() => {
        if (!profileUserId) return undefined;
        const controller = new AbortController(); // responses for a previously shown user are dropped
        const { signal } = controller;

        const fetchPosts = async () => {
            try {
                const data = await postsApi.getUserPosts(profileUserId, { signal });
                setPosts(data || []);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching posts:", error);
            }
            setLoadingPosts(false);
        };

        const fetchConnections = async () => {
            try {
                const data = await connectionsApi.getPublicConnections(profileUserId, { signal });
                setConnections(data.connections || []);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching connections:", error);
            }
            setLoadingConnections(false);
        };

        const fetchGroups = async () => {
            try {
                const data = await chatApi.getPublicGroups(profileUserId, { signal });
                setGroups(data.groups || []);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching groups:", error);
            }
            setLoadingGroups(false);
        };

        fetchPosts();
        fetchConnections();
        fetchGroups();
        return () => controller.abort();
    }, [profileUserId]);

    const showSnack = (msg) => {
        setSnack(msg);
        clearTimeout(snackTimerRef.current);
        snackTimerRef.current = setTimeout(() => setSnack(""), 2000);
    };

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;
        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
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

    const handleFollow = async () => {
        if (connectionStatus === "incoming") {
            navigate("/requests");
            return;
        }
        try {
            await connectionsApi.sendConnectionRequest(user.id, "interested", undefined, { silent: true });
            setConnectionStatus("requested");
            invalidateCachedRequests(`hover-card:${user.id}`);
            showSnack("Request sent successfully");
        } catch (error) {
            console.error("Connect failed:", error);
            const existing = error.response?.status === 409 ? error.response.data?.existing : null;
            if (existing?.status === "ignored") {
                // An old "ignored" swipe blocks new requests; clear it and send a real one
                try {
                    await connectionsApi.cancelConnection(user.id, { silent: true });
                    await connectionsApi.sendConnectionRequest(user.id, "interested", undefined, { silent: true });
                    setConnectionStatus("requested");
                    showSnack("Request sent successfully");
                } catch {
                    showSnack("Failed to send request");
                }
                return;
            }
            showSnack(error.response?.data?.message || "Failed to send request");
            loadConnectionStatus();
        }
    };

    if (loading) return <ProfileShimmering />;
    if (!user) {
        return (
            <div className="w-full max-w-md mx-auto px-4 pt-28 md:pt-16">
                <ProfileEmptyState
                    icon={UserX}
                    title="User not found"
                    hint="This profile may have been removed, or the link is wrong."
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

            <div className="w-full max-w-2xl mx-auto pt-[80px] md:pt-6 pb-[90px] relative z-10">
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

                {/* Same horizontal rhythm as ProfilePage: px-4 on mobile, flush with the header on desktop */}
                <div className="px-4 md:px-0 mt-5 md:mt-6">
                    <ProfileStats
                        stats={{
                            posts: user.postsCount || posts.length,
                            connections: user.connectionsCount || connections.length,
                            groups: user.groupsCount || groups.length,
                        }}
                        onStatClick={handleStatClick}
                    />

                    <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
                </div>

                {/* TAB CONTENT SECTION */}
                <div
                    ref={tabContentRef}
                    className="relative mt-4 md:mt-6 min-h-[400px] px-4 md:px-0 scroll-mt-32 md:scroll-mt-24"
                >
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={activeTab}
                            custom={direction}
                            variants={tabVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="w-full"
                        >
                            {activeTab === "posts" && (
                                <PublicProfilePostsTab user={user} posts={posts} loadingPosts={loadingPosts} />
                            )}

                            {activeTab === "connections" && (
                                <PublicProfileConnectionsTab
                                    connections={connections}
                                    loadingConnections={loadingConnections}
                                    currentUserId={currentUser?.id}
                                />
                            )}

                            {activeTab === "groups" && (
                                <PublicProfileGroupsTab groups={groups} loadingGroups={loadingGroups} />
                            )}

                            {activeTab === "expertise" && (
                                <section>
                                    <ProfileSectionHeading title="Professional Stack" />
                                    {hasExpertise ? (
                                        <div className="rounded-3xl p-5 md:p-8 bg-white/[0.03] border border-line shadow-soft overflow-hidden">
                                            <ExpertiseView expertise={user.expertise} />
                                        </div>
                                    ) : (
                                        <ProfileEmptyState
                                            icon={Layers}
                                            title="No expertise added"
                                            hint="Their skills and projects will show up here once they add them."
                                        />
                                    )}
                                </section>
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

            <AnimatePresence>
                {snack && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 12, x: "-50%" }}
                        transition={{ duration: 0.22, ease: EASE_SOFT }}
                        role="status"
                        className="fixed bottom-24 md:bottom-10 left-1/2 z-toast px-5 py-2.5 rounded-full bg-surface-raised border border-line text-white text-sm font-medium shadow-pop pointer-events-none whitespace-nowrap"
                    >
                        {snack}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Keyed by the user id: opening another profile from this one (a connection, the hover card) starts from
// a clean state instead of showing the previous person's posts and tab until the new ones arrive
const PublicProfilePage = () => {
    const { userId } = useParams();
    return <PublicProfileView key={userId} />;
};

export default PublicProfilePage;
