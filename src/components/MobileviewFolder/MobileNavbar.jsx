import { Home, Search, PlusSquare, Heart, User, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function MobileNavbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 w-full border-t border-neutral-800 bg-black/90 backdrop-blur-xl flex justify-around py-3 z-50 pb-safe">
            <Link to="/home" className={`p-2 rounded-xl transition-colors ${isActive('/home') ? "text-white" : "text-neutral-400"}`}>
                <Home size={24} strokeWidth={isActive('/home') ? 2.5 : 2} />
            </Link>
            <Link to="/find/findpeople" className={`p-2 rounded-xl transition-colors ${isActive('/find') ? "text-white" : "text-neutral-400"}`}>
                <Search size={24} strokeWidth={isActive('/find') ? 2.5 : 2} />
            </Link>
            <Link to="/create/post" className="p-2 rounded-xl text-neutral-400 hover:text-white transition-colors">
                <PlusSquare size={24} />
            </Link>

            <Link to="/requests" className={`p-2 rounded-xl transition-colors ${isActive('/requests') ? "text-white" : "text-neutral-400"}`}>
                <Heart size={24} />
            </Link>
            <Link to="/profile" className={`p-2 rounded-xl transition-colors ${isActive('/profile') ? "text-white" : "text-neutral-400"}`}>
                <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            </Link>
        </div>
    );
}
