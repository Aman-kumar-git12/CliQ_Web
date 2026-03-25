import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNavbar from "./components/MobileviewFolder/MobileNavbar";
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

    return (
        <div className="min-h-screen bg-neutral-950 text-white transition-colors duration-300">
            {!pathname.startsWith("/chat") && !pathname.startsWith("/post/") && <MobileTopBar />}
            <Sidebar />

            <main className={`w-full md:pl-28 md:pt-0 min-h-screen ${pathname.startsWith("/chat") ? "" : "pt-16"}`}>
                <div className={`${
                    pathname === "/home" ? "max-w-5xl" : 
                    pathname === "/my-experties" ? "max-w-none" : 
                    "max-w-2xl"
                } mx-auto ${pathname === "/my-experties" ? "" : "border-x border-neutral-200 dark:border-neutral-800"} min-h-screen transition-all duration-500`}>
                    <Outlet />
                </div>
            </main>

            {!pathname.startsWith("/chat") && <MobileNavbar />}
        </div>
    );
}
