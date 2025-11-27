import { useState } from "react";
import FindPeople from "./FindPeople";
import GetConnections from "./GetConnections";

export default function PeoplePage() {
    const [activeTab, setActiveTab] = useState("find");

    return (
        <div className="w-full">
            {/* ------------ Sticky Tabs ------------- */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 pt-4 px-4 mb-4">
                <div className="flex w-full">
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative ${activeTab === "find"
                            ? "text-black dark:text-white"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                        onClick={() => setActiveTab("find")}
                    >
                        Find People
                        {activeTab === "find" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
                        )}
                    </button>

                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-all relative ${activeTab === "connections"
                            ? "text-black dark:text-white"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                        onClick={() => setActiveTab("connections")}
                    >
                        Get Connections
                        {activeTab === "connections" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pb-20">
                {activeTab === "find" ? <FindPeople /> : <GetConnections />}
            </div>
        </div>
    );
}
