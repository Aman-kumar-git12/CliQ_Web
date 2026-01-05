import io from "socket.io-client";

const createSocketConnection = () => {
    const socket = io("http://localhost:2001", {
        withCredentials: true,
        transports: ['websocket']
    });
    return socket;
}

export default createSocketConnection;