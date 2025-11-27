import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function MobileNavbar({ dark, setDark }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 w-full border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl flex justify-around py-3 z-50 pb-safe">
            <Link to="/home" className={`p-2 rounded-xl transition-colors ${isActive('/home') ? "text-black dark:text-white" : "text-neutral-400"}`}>
                <Home size={26} strokeWidth={isActive('/home') ? 2.5 : 2} />
            </Link>
            <Link to="/search" className={`p-2 rounded-xl transition-colors ${isActive('/search') ? "text-black dark:text-white" : "text-neutral-400"}`}>
                <Search size={26} strokeWidth={isActive('/search') ? 2.5 : 2} />
            </Link>
            <button className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                <PlusSquare size={26} />
            </button>
            <button className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                <Heart size={26} />
            </button>
            <Link to="/profile" className={`p-2 rounded-xl transition-colors ${isActive('/profile') ? "text-black dark:text-white" : "text-neutral-400"}`}>
                <User size={26} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            </Link>
        </div>
    );
}
