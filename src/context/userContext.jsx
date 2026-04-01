import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";


const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);     // Stores logged-in user details
    const [blockedAccount, setBlockedAccount] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState("This account has been blocked.");
    const [blockedEmail, setBlockedEmail] = useState("");
    const [loading, setLoading] = useState(true); // True until auto-login completes
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/verify-email" || location.pathname === "/verify-otp") {
            setLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                // Backend will read token from cookies and return the user
                const res = await axiosClient.get("/auth/me");

                // If token is valid → user returned
                if (res.data.user) {
                    setUser(res.data.user);
                    setBlockedAccount(false);
                } else {
                    setUser(null);
                }
            } catch (err) {
                if (err.response?.status === 403) {
                    setBlockedAccount(true);
                    setBlockedMessage(err.response?.data?.message || "This account has been blocked.");
                    setBlockedEmail("");
                    setUser(null);
                    navigate("/blocked-account", { replace: true });
                } else {
                    setBlockedAccount(false);
                }
                // Invalid token or not logged in
                setUser(null);
            } finally {
                setLoading(false);   // Finished checking authentication
            }
        };

        checkAuth();
    }, []); // Run ONLY once on mount

    return (
        <UserContext.Provider value={{ user, setUser, loading, blockedAccount, setBlockedAccount, blockedMessage, setBlockedMessage, blockedEmail, setBlockedEmail }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
