import React from "react";



// Helper: safe fallback
const safeValue = (val, fallback = "****") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    if (val && typeof val === "object") return val;
    return val || fallback;
};

export default function Experties4({ expertise = {} }) {
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
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-4 md:p-14">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-6 md:p-12 border-l-4 md:border-l-8 border-blue-600">
                {/* HEADER */}
                <header className="mb-6 md:mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{name}</h1>
                    <p className="text-lg text-gray-600 mt-2">{description}</p>
                </header>

                {/* BODY CONTENT */}
                <section className="space-y-10 text-gray-800">
                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">About You</h3>
                        <p className="mt-2 leading-relaxed">{aboutYou}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Experience</h3>
                        <p className="mt-2">{experience}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Skills</h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {skills.map((s, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-1 bg-gray-100 border border-gray-300 text-sm rounded-md shadow-sm"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Projects</h3>
                        <p className="mt-2">{projects}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Achievements</h3>
                        <p className="mt-2">{achievements}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Interests</h3>
                        <p className="mt-2">{interests}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-700 text-lg">Contact</h3>
                        <div className="mt-2 text-gray-700">
                            <p><strong>Email:</strong> {details.email}</p>
                            <p className="mt-1"><strong>Address:</strong> {details.address}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
