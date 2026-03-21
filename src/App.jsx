
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./Layout";
import Signup from "./components/Authentication/Signup";
import Login from "./components/Authentication/Login";
import { useUserContext } from "./context/userContext";
import Profile from "./components/profile";
import EditProfile from "./components/EditProfile";
import Connections from "./components/Connections/connections";
import ConnectionsRequest from "./components/Connections/connectionsRequests";
import FindPeople from "./components/Connections/FindPeople";
import GetConnections from "./components/Connections/GetConnections";

import Settings from "./components/Settings";

import IndividualPost from "./components/Post/IndividualPost";
import EditPost from "./components/Post/EditPost";

import { FeedProvider } from "./context/FeedContext";
import CreatePost from "./components/Post/CreatePost";
import MyExperties from "./components/MyExperties/EditExperties";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import PublicProfile from "./components/PublicProfile";

import MessagesInbox from "./components/Messages";
import ChatUI from "./components/Chat/chat";
import ChatLayout from "./components/Chat/ChatLayout";
import { MessageSquare } from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import { useState, useEffect } from "react";

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
          {/* Public Routes (Redirect to Home if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<ChatLayout />}>
              <Route path="/messages" element={<NoChatSelected />} />
              <Route path="/messages/:targetuserId" element={<ChatUI />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile/:customTab?" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/find" element={<Connections />}>
                <Route index element={<Navigate to="findpeople" replace />} />
                <Route path="findpeople" element={<FindPeople />} />
                <Route path="getconnection" element={<GetConnections />} />
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
        </Routes>
      </FeedProvider>

    </>
  );
}

const NoChatSelected = () => (
  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-6 bg-black relative overflow-hidden">
    {/* Subtle Background Glow */}
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
        <div className="w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] animate-pulse duration-1000"></div>
    </div>
    
    <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-out">
        <div className="relative mb-8 group cursor-default">
            {/* Hover Glow */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-red-600/20 via-red-600/5 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 group-hover:scale-110 opacity-70"></div>
            
            {/* Icon Container */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#121212] to-[#1c1c1e] border border-white/5 flex items-center justify-center relative shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500">
                <MessageSquare size={48} className="text-neutral-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-red-500 transition-colors duration-500" strokeWidth={1.5} />
                
                {/* Decorative Dots */}
                <div className="absolute top-2 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1c1c1e] shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-bounce duration-1000 delay-150"></div>
            </div>
        </div>
        
        <div className="text-center max-w-sm px-4">
            <h3 className="text-white font-extrabold text-[26px] mb-3 tracking-tighter">Your Messages</h3>
            <p className="text-neutral-400 text-[15px] leading-relaxed">
                Select a conversation from the sidebar to continue chatting, or start a new connection.
            </p>
        </div>
    </div>
  </div>
);

export default App;
