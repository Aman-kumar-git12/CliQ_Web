import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { SESSION_EXPIRED_EVENT } from "../api/axiosClient";
import { warmSmartConnectionsCache } from "../utils/smartConnectionCache";
import { clearRequestCache } from "../utils/requestCache";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores logged-in user details
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
                const data = await authApi.getCurrentUser();

                // If token is valid → user returned
                if (data.user) {
                    setUser(data.user);
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
                setLoading(false); // Finished checking authentication
            }
        };

        checkAuth();
        // Runs once per page load: the session check must not repeat on every navigation
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ends the session on the server and clears the user everywhere in the app,
    // even if the request fails, so no screen keeps showing the old account
    const logout = async () => {
        try {
            await authApi.logout({}, { silent: true });
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
        }
    };

    // A 401 anywhere (or a socket refused for an ended session) means this browser's session is over,
    // e.g. the password was changed on another device: clear the user once and go to login
    const userRef = useRef(user);
    userRef.current = user;
    useEffect(() => {
        const onSessionExpired = () => {
            if (!userRef.current) return;
            setUser(null);
            navigate("/login", { replace: true, state: { sessionExpired: true } });
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    }, [navigate]);

    useEffect(() => {
        // Cached reads (suggestions, hover cards…) belong to the account that loaded them
        clearRequestCache();
        if (!user?.id) return;
        warmSmartConnectionsCache({ userId: user.id });
    }, [user?.id]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                logout,
                loading,
                blockedAccount,
                setBlockedAccount,
                blockedMessage,
                setBlockedMessage,
                blockedEmail,
                setBlockedEmail,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
