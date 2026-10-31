import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";

// Page frame for Explore (Get Connections). Find People now lives in Search.
export default function ExplorePage() {
    const location = useLocation();

    // Start Explore at the top on mobile whenever the panel (pathname) changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "instant"
                });
            });
        }
    }, [location.pathname]);

    return (
        <div className="w-full relative min-h-screen md:h-[100dvh] pt-[85px] md:pt-2 pb-24 md:pb-0 bg-transparent overflow-visible md:overflow-hidden flex flex-col px-4 md:px-0 no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            <div className="relative z-10 px-0 max-w-full flex-1 min-h-0 overflow-visible md:overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
}
