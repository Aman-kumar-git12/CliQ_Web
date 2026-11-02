import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from "./context/UserContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { initMonitoring } from "./utils/monitoring";

initMonitoring();

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename="/">
        <UserContextProvider>
            <SocketProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </SocketProvider>
        </UserContextProvider>
    </BrowserRouter>,
);
