import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation, Outlet as RouterOutlet } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "./components/Home";
import Layout from "./Layout";
import Signup from "./components/Authentication/Signup";
import Login from "./components/Authentication/Login";
import VerifyEmail from "./components/Authentication/VerifyEmail";
import VerifyOTP from "./components/Authentication/VerifyOTP";
import { useUserContext } from "./context/userContext";
import Profile from "./components/profile";
import EditProfile from "./components/EditProfile";
import Connections from "./components/Connections/connections";
import ConnectionsRequest from "./components/Connections/connectionsRequests";
import FindPeople from "./components/Connections/FindPeople";
import GetConnections from "./components/Connections/GetConnections";

import Settings from "./components/Settings";

import IndividualPost from "./components/Post/IndividualPost";

import { FeedProvider } from "./context/FeedContext";
import CreatePost from "./components/Post/CreatePost";
import MyExperties from "./components/MyExperties/EditExperties";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import PublicProfile from "./components/PublicProfile";

import ChatUI from "./components/Chat/chat";
import ChatLayout from "./components/Chat/ChatLayout";
import { MessageSquare } from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import BlockedAccount from "./components/BlockedAccount";
import SidebarComponent from "./components/Sidebar";
import MobileNav from "./components/MobileNav.jsx";

// Global layout to keep Sidebar persistent and animating smoothly
const AuthenticatedLayout = () => {
    const location = useLocation();
    const isChatView = location.pathname.startsWith("/messages") || location.pathname.startsWith("/chat");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div id="root-container" className="flex w-full min-h-screen bg-[#050505] text-white relative overflow-hidden transition-all duration-700">
            {/* ------------ Premium Global Background (Static during navigation) ------------- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#050505]" />

                {/* High-Visibility Square Grid */}
                <div 
                    className="absolute inset-0 opacity-[0.4]" 
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(167, 139, 250, 0.15) 1.2px, transparent 1.2px),
                            linear-gradient(to bottom, rgba(167, 139, 250, 0.15) 1.2px, transparent 1.2px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Unified Purple Ambient Glows */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-[#8b5cf6] rounded-full blur-[140px]"
                />
                <motion.div
                    animate={{ scale: [1.15, 1, 1.15], opacity: [0.06, 0.1, 0.06] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-[#a78bfa] rounded-full blur-[140px]"
                />
            </div>

            <div className="flex w-full relative z-10">
                <SidebarComponent />
                <motion.div 
                    initial={false}
                    animate={{ paddingLeft: isMobile ? 0 : (isChatView ? 90 : 260) }}
                    transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                    className="flex-1 w-full min-w-0"
                >
                    <RouterOutlet />
                </motion.div>
            </div>
            
            {/* Mobile Navigation Bar - Only visible on small screens */}
            {!isChatView && MobileNav && <MobileNav />}
        </div>
    );
};

const NoChatSelected = () => (
  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-6 bg-black relative overflow-hidden">
    {/* Subtle Background Glow - CLIQ theme */}
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none z-0">
      <div className="w-[600px] h-[600px] bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] rounded-full blur-[150px] animate-pulse duration-1000"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-out">
      <div className="relative mb-10 group cursor-default">
        {/* Hover Glow */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-[#8b5cf6]/20 via-[#ec4899]/10 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 group-hover:scale-110 opacity-80"></div>

        {/* Icon Container */}
        <div className="w-32 h-32 rounded-full bg-[#110f18] border border-white/5 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <MessageSquare size={52} className="text-[#8f89a7] drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:text-white transition-colors duration-500 relative z-10" strokeWidth={1.5} />

          {/* Decorative Dot */}
          <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full border-2 border-[#110f18] shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-pulse duration-1000 z-20"></div>
        </div>
      </div>

      <div className="text-center max-w-md px-6">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 font-black text-[32px] mb-4 tracking-tighter">Your Messages</h3>
        <p className="text-[#8f89a7] text-[16px] leading-relaxed font-medium">
          Select a conversation from the sidebar to continue chatting, or start a new connection.
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const { loading } = useUserContext();
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
      {showSplash && (
        <SplashScreen
          onFinish={handleSplashFinish}
          isAppReady={!loading}
        />
      )}
      <FeedProvider>
        <Routes>
          <Route path="/blocked-account" element={<BlockedAccount />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Public Routes (Redirect to Home if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route element={<ChatLayout />}>
                <Route path="/messages" element={<NoChatSelected />} />
                <Route path="/messages/:targetuserId/:actionParam?" element={<ChatUI />} />
              </Route>

              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profile/:customTab?" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/find" element={<Connections />}>
                  <Route index element={<Navigate to="findpeople" replace />} />
                  <Route path="findpeople" element={<FindPeople />} />
                  <Route path="getconnection/:panel?" element={<GetConnections />} />
                </Route>
                <Route path="/requests" element={<ConnectionsRequest />} />

                {/* Post Routes */}
                <Route path="/post/:postId" element={<IndividualPost />} />
                <Route path="/post/:postId/edit" element={<IndividualPost />} />
                <Route path="/create/post" element={<CreatePost />} />
                <Route path="/my-experties" element={<MyExperties />} />

                <Route path="/chat" element={<Navigate to="/messages" replace />} />
                <Route path="/public-profile/:userId" element={<PublicProfile />} />
                <Route path="/user/:userId" element={<PublicProfile />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </FeedProvider>
    </>
  );
}

export default App;
