import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileNavbar from "./MobileviewFolder/MobileNavbar";

export default function Layout() {
    const [dark, setDark] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark";
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    return (
        <div className={`min-h-screen ${dark ? "dark bg-neutral-950 text-white" : "bg-white text-black"} transition-colors duration-300`}>
            <div className="flex max-w-7xl mx-auto">
                <Sidebar dark={dark} setDark={setDark} />

                <main className="flex-1 w-full pl-0 md:pl-24 pt-6 pb-20 md:pb-0 px-4 max-w-3xl mx-auto">
                    <Outlet />
                </main>
            </div>

            <MobileNavbar dark={dark} setDark={setDark} />
        </div>
    );
}
