import io from "socket.io-client";

const createSocketConnection = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const socket = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
    });
    return socket;
}

export default createSocketConnection;