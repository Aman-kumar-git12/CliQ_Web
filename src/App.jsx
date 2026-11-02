import { lazy, Suspense, useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation, Outlet as RouterOutlet } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import { useUserContext } from "./context/UserContext";

import { FeedProvider } from "./context/FeedContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import ChatLayout from "./layouts/ChatLayout";
import { MessageSquare } from "lucide-react";
import SplashScreen from "./components/layout/SplashScreen";
import SidebarComponent from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav.jsx";
import GlobalToaster from "./components/common/GlobalToaster";
import ErrorBoundary from "./components/common/ErrorBoundary";
import RouteShimmering from "./components/shimmering/RouteShimmering";
import { pageTitle } from "./utils/pageTitles";
import { useMediaQuery } from "./hooks/useMediaQuery";

// Pages load on first visit, so the first screen doesn't download the whole app
// The help chatbot (and its Markdown renderer) loads after the page, it isn't needed for first paint
const Chatbot = lazy(() => import("./components/chatbot/Chatbot"));
const loadHomePage = () => import("./pages/HomePage");
const loadProfilePage = () => import("./pages/ProfilePage");
const loadPostPage = () => import("./pages/PostPage");
const loadChatPage = () => import("./pages/ChatPage");
const HomePage = lazy(loadHomePage);
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const VerifyOtpPage = lazy(() => import("./pages/auth/VerifyOtpPage"));
const ProfilePage = lazy(loadProfilePage);
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const GetConnectionsPage = lazy(() => import("./pages/GetConnectionsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PostPage = lazy(loadPostPage);
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const ExpertiseStudioPage = lazy(() => import("./pages/ExpertiseStudioPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const ChatPage = lazy(loadChatPage);
const BlockedAccountPage = lazy(() => import("./pages/auth/BlockedAccountPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SavedPostsPage = lazy(() => import("./pages/SavedPostsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));

// The page a visit starts on is downloaded while the session check (/auth/me) is still running, instead
// of after it: protected pages only render once the user is known, which used to start the download late.
// Login and signup lead to Home, so Home is fetched there too.
const preloadFirstPage = (pathname) => {
    if (pathname === "/" || pathname === "/login" || pathname === "/home") return loadHomePage();
    if (pathname.startsWith("/profile")) return loadProfilePage();
    if (pathname.startsWith("/post/")) return loadPostPage();
    if (pathname.startsWith("/messages/")) return loadChatPage();
    return null;
};

// Global layout to keep Sidebar persistent and animating smoothly
const AuthenticatedLayout = () => {
    const location = useLocation();
    const isChatView = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <div
            id="root-container"
            className={`flex w-full ${isChatView ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-hidden"} bg-surface-950 text-white relative transition-all duration-700`}
        >
            {/* ------------ Premium Global Background (Static during navigation) ------------- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-surface-950" />

                {/* High-Visibility Square Grid */}
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(167, 139, 250, 0.15) 1.2px, transparent 1.2px),
                            linear-gradient(to bottom, rgba(167, 139, 250, 0.15) 1.2px, transparent 1.2px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />

                {/* Unified Purple Ambient Glows */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-brand rounded-full blur-[140px]"
                />
                <motion.div
                    animate={{ scale: [1.15, 1, 1.15], opacity: [0.06, 0.1, 0.06] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-brand-light rounded-full blur-[140px]"
                />
            </div>

            <div className={`flex w-full relative z-10 ${isChatView ? "h-full" : ""}`}>
                <SidebarComponent />
                <motion.div
                    initial={false}
                    animate={{ paddingLeft: isMobile ? 0 : isChatView ? 90 : 260 }}
                    transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                    className={`flex-1 w-full min-w-0 ${isChatView ? "h-full flex flex-col" : ""}`}
                >
                    <RouterOutlet />
                </motion.div>
            </div>

            {/* Mobile Navigation Bar - Only visible on small screens */}
            {!isChatView && MobileNav && <MobileNav />}

            {/* CliQ AI help chat on every page except open chat threads, where it would cover the message box */}
            {!isChatView && (
                <Suspense fallback={null}>
                    <Chatbot />
                </Suspense>
            )}
        </div>
    );
};

const NoChatSelected = () => (
    <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-6 bg-black relative overflow-hidden">
        {/* Subtle Background Glow - CLIQ theme */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
            <div className="w-[600px] h-[600px] bg-gradient-to-tr from-brand to-brand-pink rounded-full blur-[150px] animate-pulse duration-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-out">
            <div className="relative mb-10 group cursor-default">
                {/* Hover Glow */}
                <div className="absolute -inset-8 bg-gradient-to-tr from-brand/20 via-brand-pink/10 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 group-hover:scale-110 opacity-80"></div>

                {/* Icon Container */}
                <div className="w-32 h-32 rounded-full bg-surface-700 border border-white/5 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <MessageSquare
                        size={52}
                        className="text-ink-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:text-white transition-colors duration-500 relative z-10"
                        strokeWidth={1.5}
                    />

                    {/* Decorative Dot */}
                    <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-r from-brand to-brand-pink rounded-full border-2 border-surface-700 shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-pulse duration-1000 z-20"></div>
                </div>
            </div>

            <div className="text-center max-w-md px-6">
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 font-black text-[32px] mb-4 tracking-tighter">
                    Your Messages
                </h3>
                <p className="text-ink-300 text-[16px] leading-relaxed font-medium">
                    Select a conversation from the sidebar to continue chatting, or start a new connection.
                </p>
            </div>
        </div>
    </div>
);

function App() {
    const { loading } = useUserContext();
    const { pathname } = useLocation();

    useEffect(() => {
        preloadFirstPage(pathname)?.catch(() => {}); // a failed preload is retried by lazy() on render
        // Only the page the visit starts on
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Each page gets its own browser-tab title, e.g. "Messages · CliQ"
    useEffect(() => {
        document.title = pageTitle(pathname);
    }, [pathname]);
    const [showSplash, setShowSplash] = useState(() => {
        // Check synchronously on mount if splash has been seen
        return !sessionStorage.getItem("splashSeen");
    });

    // No useEffect needed for checking, as we do it in initial state

    const handleSplashFinish = () => {
        setShowSplash(false);
        sessionStorage.setItem("splashSeen", "true");
    };

    return (
        <>
            {showSplash && <SplashScreen onFinish={handleSplashFinish} isAppReady={!loading} />}
            <GlobalToaster />
            {/* Last resort: layouts have their own boundaries that keep the sidebar usable */}
            <ErrorBoundary>
                {/* Auth and legal pages; signed-in pages have their own boundary in MainLayout / ChatLayout */}
                <Suspense fallback={<RouteShimmering pathname={pathname} />}>
                    <FeedProvider>
                        <Routes>
                            <Route path="/blocked-account" element={<BlockedAccountPage />} />
                            <Route path="/verify-email" element={<VerifyEmailPage />} />
                            <Route path="/verify-otp" element={<VerifyOtpPage />} />
                            {/* Legal pages: readable whether or not you're logged in */}
                            <Route path="/privacy" element={<PrivacyPolicyPage />} />
                            <Route path="/terms" element={<TermsPage />} />

                            {/* Public Routes (Redirect to Home if logged in) */}
                            <Route element={<PublicRoute />}>
                                <Route path="/" element={<SignupPage />} />
                                <Route path="/login" element={<LoginPage />} />
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route element={<AuthenticatedLayout />}>
                                    <Route element={<ChatLayout />}>
                                        <Route path="/messages" element={<NoChatSelected />} />
                                        <Route path="/messages/:targetuserId/:actionParam?" element={<ChatPage />} />
                                    </Route>

                                    <Route element={<MainLayout />}>
                                        <Route path="/home" element={<HomePage />} />
                                        <Route path="/profile/:customTab?" element={<ProfilePage />} />
                                        <Route path="/edit-profile" element={<EditProfilePage />} />
                                        <Route path="/settings" element={<SettingsPage />} />
                                        <Route path="/find" element={<ExplorePage />}>
                                            <Route index element={<Navigate to="getconnection" replace />} />
                                            {/* Find People moved into Search; keep old links working */}
                                            <Route path="findpeople" element={<Navigate to="/search" replace />} />
                                            <Route path="getconnection/:panel?" element={<GetConnectionsPage />} />
                                        </Route>
                                        <Route path="/requests" element={<RequestsPage />} />
                                        <Route path="/notifications" element={<NotificationsPage />} />
                                        <Route path="/search" element={<SearchPage />} />
                                        <Route path="/saved" element={<SavedPostsPage />} />

                                        {/* Post Routes */}
                                        <Route path="/post/:postId" element={<PostPage />} />
                                        <Route path="/post/:postId/edit" element={<PostPage />} />
                                        <Route path="/create/post" element={<CreatePostPage />} />
                                        <Route path="/my-experties" element={<ExpertiseStudioPage />} />

                                        <Route path="/chat" element={<Navigate to="/messages" replace />} />
                                        <Route path="/public-profile/:userId" element={<PublicProfilePage />} />
                                        <Route path="/user/:userId" element={<PublicProfilePage />} />
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Route>
                                </Route>
                            </Route>
                        </Routes>
                    </FeedProvider>
                </Suspense>
            </ErrorBoundary>
        </>
    );
}

export default App;
