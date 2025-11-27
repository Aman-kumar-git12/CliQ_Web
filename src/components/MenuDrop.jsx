import { useState } from "react";

export default function MenuDropdown() {
    const [openMenu, setOpenMenu] = useState(false);
    const [openAppearance, setOpenAppearance] = useState(false);

    return (
        <div className="relative inline-block text-left">
            {/* Menu Button */}
            <button
                onClick={() => setOpenMenu(!openMenu)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
                Menu
            </button>

            {/* Main Menu */}
            {openMenu && (
                <div className="absolute mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">

                    {/* Appearance */}
                    <div
                        className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        onMouseEnter={() => setOpenAppearance(true)}
                        onMouseLeave={() => setOpenAppearance(false)}
                    >
                        <span className="font-medium text-gray-700">Appearance</span>
                        <span className="text-gray-500">▶</span>

                        {/* Submenu */}
                        {openAppearance && (
                            <div className="absolute left-48 top-0 w-44 bg-white rounded-xl shadow-lg border border-gray-200">

                                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
                                    Light Mode
                                </div>

                                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
                                    Dark Mode
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700 font-medium border-t border-gray-100">
                        Settings
                    </div>
                </div>
            )}
        </div>
    );
}
