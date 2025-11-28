import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);     // Stores logged-in user details
    const [loading, setLoading] = useState(true); // True until auto-login completes
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Backend will read token from cookies and return the user
                const res = await axiosClient.get("/auth/me");

                // If token is valid → user returned
                if (res.data.user) {
                    setUser(res.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                // Invalid token or not logged in
                setUser(null);
            } finally {
                setLoading(false);   // Finished checking authentication
            }
        };

        checkAuth();
    }, []); // Run once on mount

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
