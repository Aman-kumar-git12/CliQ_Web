import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import MessagesInbox from "../Messages";

export default function ChatLayout() {
    const location = useLocation();
    const isChatSelected = location.pathname !== "/messages";

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
            {/* Standard Sidebar (Fixed) */}
            <Sidebar />

            <div className="flex-1 flex md:pl-28 transition-all duration-300">
                {/* Column 2: Conversation List */}
                <div className={`w-full md:w-[350px] shrink-0 h-full flex-col border-r-[3px] border-red-600/80 shadow-[10px_0_30px_rgba(220,38,38,0.1)] z-10 transition-all ${isChatSelected ? 'hidden md:flex' : 'flex'}`}>
                    <MessagesInbox />
                </div>

                {/* Column 3: Chat Window */}
                <div className={`flex-1 h-full min-w-0 bg-[#000000] relative ${isChatSelected ? 'block' : 'hidden md:block'}`}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
