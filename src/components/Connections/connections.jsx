import { Link, useLocation, Outlet } from "react-router-dom";

export default function PeoplePage() {
    const location = useLocation();

    // Determine active tab based on URL path
    const getActiveTab = () => {
        if (location.pathname.includes("/find/getconnection")) return "getconnection";
        return "find";
    };

    const activeTab = getActiveTab();

    return (
        <div className="w-full">
            {/* ------------ Sticky Tabs ------------- */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 pt-4 px-4 mb-4">
                <div className="flex w-full">
                    <Link
                        to="/find/findpeople"
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative text-center ${activeTab === "find"
                            ? "text-black dark:text-white"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                    >
                        Find People
                        {activeTab === "find" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
                        )}
                    </Link>

                    <Link
                        to="/find/getconnection"
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative text-center ${activeTab === "getconnection"
                            ? "text-black dark:text-white"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                    >
                        Get Connections
                        {activeTab === "getconnection" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
                        )}
                    </Link>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pb-20">
                <Outlet />
            </div>
        </div>
    );
}
