
import React from "react";



// Helper: safe fallback
const safeValue = (val, fallback = "****") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    if (val && typeof val === "object") return val;
    return val || fallback;
};

export default function Experties2({ expertise = {} }) {
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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row bg-white shadow-2xl rounded-xl overflow-hidden min-h-[90vh]">
                <div className="w-full md:w-72 bg-blue-600 text-white p-8 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                        {name[0]}
                    </div>
                    <h2 className="text-2xl font-semibold text-center">{name}</h2>
                    <p className="text-sm opacity-90 text-center">{description}</p>

                    <div className="mt-4 text-sm text-white/90 text-center w-full">
                        <div className="flex md:block justify-center gap-4 md:gap-0">
                            <div><strong>Exp:</strong> {experience}</div>
                            <div className="mt-0 md:mt-2"><strong>Email:</strong> {details.email}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-10">
                    <h3 className="font-semibold text-gray-500">About</h3>
                    <p className="mt-2 text-gray-700">{aboutYou}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div>
                            <h4 className="font-semibold text-gray-500">Skills</h4>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-500">Projects</h4>
                            <p className="mt-3 text-gray-700">{projects}</p>

                            <h4 className="font-semibold text-gray-500 mt-6">Achievements</h4>
                            <p className="mt-3 text-gray-700">{achievements}</p>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-between text-sm text-gray-700">
                        <div><strong>Interests:</strong> {interests}</div>
                        <div><strong>Address:</strong> {details.address}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
