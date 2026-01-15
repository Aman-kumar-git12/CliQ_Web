import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNavbar from "./components/MobileviewFolder/MobileNavbar";
import MobileTopBar from "./components/MobileviewFolder/MobileTopBar";

export default function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on route change, except for Home (which handles its own restoration)
    useEffect(() => {
        if (pathname !== "/home" && !pathname.startsWith("/chat")) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return (
        <div className="min-h-screen bg-neutral-950 text-white transition-colors duration-300">
            {!pathname.startsWith("/chat") && <MobileTopBar />}
            <Sidebar />

            <main className={`w-full md:pl-28 md:pt-0 min-h-screen ${pathname.startsWith("/chat") ? "" : "pt-16"}`}>
                <div className="max-w-2xl mx-auto border-x border-neutral-800 min-h-screen">
                    <Outlet />
                </div>
            </main>

            {!pathname.startsWith("/chat") && <MobileNavbar />}
        </div>
    );
}
