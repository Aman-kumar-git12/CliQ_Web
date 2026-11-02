import { createContext, useContext, useEffect, useState } from "react";
import createSocketConnection from "../api/socket";
import { SESSION_EXPIRED_EVENT, refreshSession } from "../api/axiosClient";
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
        // The server refuses the socket when the access token has run out (renew it and reconnect)
        // or the session has ended (log out); see socket.js on the backend
        let closed = false;
        connection.on("connect_error", async (err) => {
            const message = err?.message || "";
            if (message === "TOKEN_EXPIRED") {
                const result = await refreshSession();
                if (closed) return;
                if (result === "ended") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
                // Renewed: connect now. Server unreachable: try again shortly (it may be restarting)
                else setTimeout(() => !closed && connection.connect(), result === "renewed" ? 0 : 5000);
            } else if (/session ended|authentication required|user not found/i.test(message)) {
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            }
        });
        setSocket(connection);
        return () => {
            closed = true;
            connection.disconnect();
            setSocket(null);
        };
    }, [user?.id]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

/** @returns {import("socket.io-client").Socket | null} the shared connection, or null while logged out */
export const useSocket = () => useContext(SocketContext);
