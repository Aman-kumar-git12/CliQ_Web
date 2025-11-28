import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./Layout";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { UserContextProvider } from "./context/userContext";
import Profile from "./components/profile";
import EditProfile from "./components/EditProfile";
import Connections from "./components/Connections/connections";
import ConnectionsRequest from "./components/Connections/connectionsRequests";

import Settings from "./components/Settings";

import IndividualPost from "./components/Post/IndividualPost";
import EditPost from "./components/Post/EditPost";

function App() {
  return (
    <BrowserRouter basename="/">
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected/App Routes */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/connections/requests" element={<ConnectionsRequest />} />

            {/* Post Routes */}
            <Route path="/post/:postId" element={<IndividualPost />} />
            <Route path="/post/edit/:postId" element={<EditPost />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </BrowserRouter>
  );
}

export default App;
