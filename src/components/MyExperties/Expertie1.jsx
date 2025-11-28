import React from "react";

// Helper: safe fallback
const safeValue = (val, fallback = "****") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    if (val && typeof val === "object") return val;
    return val || fallback;
};

export default function Expertise1({ expertise = {} }) {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-10">
            <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-14 border border-gray-200">

                <header className="mb-8 md:mb-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-black">{name}</h1>
                    <p className="text-lg md:text-xl text-black mt-2 md:mt-3">{description}</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* LEFT SIDE */}
                    <div className="md:col-span-6 w-full">
                        <h2 className="text-lg font-semibold text-black border-b border-black pb-1">About You</h2>
                        <p className="mt-3 text-black">{aboutYou}</p>

                        <div className="mt-8">
                            <h3 className="font-semibold text-black border-b border-black pb-1">Projects</h3>
                            <p className="mt-3 text-black">{projects}</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold text-black border-b border-black pb-1">Achievements</h3>
                            <p className="mt-3 text-black">{achievements}</p>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR — NOW EVEN WIDER */}
                    <aside className="md:col-span-6 bg-gray-100 p-8 rounded-2xl border border-gray-300 shadow-sm">
                        <div>
                            <h3 className="font-semibold text-black text-lg">Experience</h3>
                            <p className="mt-2 text-black text-base">{experience}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold text-black text-lg">Skills</h3>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-3 py-1 text-sm bg-black text-white rounded-full">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold text-black text-lg">Interests</h3>
                            <p className="mt-2 text-black">{interests}</p>
                        </div>

                        <div className="mt-10 border-t border-gray-300 pt-4 text-sm text-black space-y-2">
                            <p><strong>Email:</strong> {details.email}</p>
                            <p><strong>Address:</strong> {details.address}</p>
                        </div>
                    </aside>

                </section>




            </div>
        </div>
    );
}
