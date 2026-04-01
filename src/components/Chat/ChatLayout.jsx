import { Outlet, useLocation } from "react-router-dom";
import MessagesInbox from "../Messages";
import Sidebar from "../Sidebar";
import { motion } from "framer-motion";

export default function ChatLayout() {
    const location = useLocation();
    const isChatSelected = location.pathname !== "/messages";

    return (
        <div className="flex h-full w-full overflow-hidden bg-transparent text-white relative">
            <div className="flex-1 flex min-w-0 relative z-10">
                {/* Column 2: Conversation List */}
                <div className={`w-full md:w-[310px] shrink-0 h-full flex flex-col border-r border-white/5 bg-[#0e0d14]/60 backdrop-blur-3xl z-10 transition-all duration-500 ${isChatSelected ? 'hidden md:flex' : 'flex'}`}>
                    <MessagesInbox />
                </div>

                {/* Column 3: Chat Window */}
                <div className={`flex-1 h-full min-w-0 bg-transparent relative ${isChatSelected ? 'block' : 'hidden md:block'}`}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
