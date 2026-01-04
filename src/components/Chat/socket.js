import io from "socket.io-client";

const createSocketConnection = ()=>{
    const socket = io("http://localhost:2001");
    return socket;
}

export default createSocketConnection;