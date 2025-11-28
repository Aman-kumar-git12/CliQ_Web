import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNavbar from "./components/MobileviewFolder/MobileNavbar";
import MobileTopBar from "./components/MobileviewFolder/MobileTopBar";

export default function Layout() {
    const [dark, setDark] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark";
    });

    const { pathname } = useLocation();

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    // Scroll to top on route change, except for Home (which handles its own restoration)
    useEffect(() => {
        if (pathname !== "/home") {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return (
        <div className={`min-h-screen ${dark ? "dark bg-neutral-950 text-white" : "bg-white text-black"} transition-colors duration-300`}>
            <MobileTopBar dark={dark} setDark={setDark} />
            <Sidebar dark={dark} setDark={setDark} />

            <main className="w-full md:pl-28 pt-16 md:pt-0 min-h-screen">
                <div className="max-w-2xl mx-auto border-x border-neutral-200 dark:border-neutral-800 min-h-screen">
                    <Outlet />
                </div>
            </main>

            <MobileNavbar dark={dark} setDark={setDark} />
        </div>
    );
}
