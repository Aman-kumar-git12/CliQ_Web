import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileTopBar from "./components/MobileviewFolder/MobileTopBar";

export default function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on route change, except for Home, Profile sub-tabs, and Chat
    useEffect(() => {
        if (
            pathname !== "/home" &&
            !pathname.startsWith("/chat") &&
            !pathname.startsWith("/profile")
        ) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    const isChatView = pathname.startsWith("/messages") || pathname.startsWith("/chat");
    const isConnectionsView = pathname.startsWith("/find") || pathname.startsWith("/requests");

    return (
        <div className="w-full relative min-h-screen bg-transparent text-white flex overflow-hidden">
            <div className="w-full min-h-screen relative z-10 bg-transparent">
                {!pathname.startsWith("/chat") && !pathname.startsWith("/post/") && <MobileTopBar />}

                <div className={`${pathname === "/home" ? "max-w-[1200px]" :
                    isChatView || pathname === "/my-experties" || isConnectionsView ? "max-w-none" :
                        "max-w-2xl"
                    } mx-auto min-h-screen transition-all duration-500 flex justify-center overflow-visible bg-transparent`}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
