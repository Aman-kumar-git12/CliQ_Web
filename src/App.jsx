
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
import MyConnection from "./components/MyConnection";
import ChatUI from "./components/Chat/chat";
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

          {/* Protected Routes (Redirect to Login if not logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
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
              <Route path="/my-connections" element={<MyConnection />} />
              <Route path="/chat" element={<Navigate to="/my-connections" replace />} />
              <Route path="/chat/:targetuserId" element={<ChatUI />} />
              <Route path="/public-profile/:userId" element={<PublicProfile />} />
              <Route path="/user/:userId" element={<PublicProfile />} />
            </Route>
          </Route>
        </Routes>
      </FeedProvider>

    </>
  );
}

export default App;
