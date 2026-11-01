import { createContext, useContext, useEffect, useState } from "react";
import createSocketConnection from "../api/socket";
import { SESSION_EXPIRED_EVENT } from "../api/axiosClient";
import { useUserContext } from "./UserContext";

const SocketContext = createContext(null);

// One Socket.IO connection per logged-in user, shared by notifications and chat.
// Consumers add their own listeners and remove them on cleanup; only this provider disconnects.
export const SocketProvider = ({ children }) => {
    const { user } = useUserContext();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        const connection = createSocketConnection();
        // The server refuses the socket once the session has ended (see socket.js on the backend)
        connection.on("connect_error", (err) => {
            if (/session ended|authentication required|user not found/i.test(err?.message || "")) {
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            }
        });
        setSocket(connection);
        return () => {
            connection.disconnect();
            setSocket(null);
        };
    }, [user?.id]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

/** @returns {import("socket.io-client").Socket | null} the shared connection, or null while logged out */
export const useSocket = () => useContext(SocketContext);
