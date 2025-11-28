import React from "react";

// Helper: safe fallback


// Helper: safe fallback
const safeValue = (val, fallback = "****") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    if (val && typeof val === "object") return val;
    return val || fallback;
};

export default function Experties3({ expertise = {} }) {
    const name = safeValue(expertise.name);
    const description = safeValue(expertise.description);
    const experience = safeValue(expertise.experience);
    const skills = Array.isArray(expertise.skills) ? expertise.skills : [];
    const projects = safeValue(expertise.projects);
    const achievements = safeValue(expertise.achievements);
    const interests = safeValue(expertise.interests);
    const aboutYou = safeValue(expertise.aboutYou);
    const details = safeValue(expertise.details, { email: "****", address: "****" });


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-700 via-gray-800 to-black text-white p-4 md:p-10">
            <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl p-6 md:p-14 shadow-2xl">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-200">{name}</h1>
                    <p className="mt-2 text-gray-300">{description}</p>
                </header>


                {/* BLOCK 2 (EXACT SAME, CONSISTENT WIDTH) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* LEFT SECTION */}
                    <div className="md:col-span-5">
                        <h2 className="text-sm font-semibold text-indigo-200">About You</h2>
                        <p className="mt-3 text-gray-200 leading-relaxed">{aboutYou}</p>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-indigo-200">Projects</h3>
                            <p className="mt-3 text-gray-300">{projects}</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-indigo-200">Achievements</h3>
                            <p className="mt-3 text-gray-300">{achievements}</p>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR — MORE WIDE */}
                    <aside className="md:col-span-7 p-10 bg-white/10 rounded-xl border border-white/20 shadow-lg backdrop-blur-md">

                        <div>
                            <h3 className="text-sm font-semibold text-indigo-100">Experience</h3>
                            <p className="mt-2 text-gray-200">{experience}</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-indigo-100">Skills</h3>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {skills.map((s, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm bg-white/20 text-white rounded shadow"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-indigo-100">Interests</h3>
                            <p className="mt-2 text-gray-200">{interests}</p>
                        </div>

                        <div className="mt-10 border-t border-white/20 pt-4 text-sm text-gray-300 space-y-2">
                            <p><strong>Email:</strong> {details.email}</p>
                            <p><strong>Address:</strong> {details.address}</p>
                        </div>

                    </aside>

                </div>


            </div>
        </div>
    );
}
