import React from "react";
import { User, Briefcase, Award, Zap, Code, Mail, MapPin, Terminal, Cpu, Activity } from "lucide-react";

const safeValue = (val, fallback = "—") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    return val || fallback;
};

export default function Experties4({ expertise = {} }) {
    const name = safeValue(expertise.name, "Tech Innovator");
    const description = safeValue(expertise.description, "Systems Architect");
    const experience = safeValue(expertise.experience);
    const skills = Array.isArray(expertise.skills) ? expertise.skills : [];
    const projects = safeValue(expertise.projects);
    const achievements = safeValue(expertise.achievements);
    const interests = safeValue(expertise.interests);
    const aboutYou = safeValue(expertise.aboutYou);
    const details = expertise.details || { email: "engineer@cliq.com", address: "Orbit" };

    return (
        <div className="bg-[#F0F4F8] p-1 font-mono selection:bg-teal-100">
            <div className="w-full bg-white rounded-[1.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-neutral-200 relative group/terminal">
                
                {/* SUBTLE TECH GRID */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {/* TECH HEADER */}
                <header className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 relative group">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-800 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-neutral-200">
                            <Activity size={10} className="text-teal-500 animate-pulse" /> Core.System.v4.0
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-[1000] tracking-tighter text-neutral-950 uppercase italic leading-[0.8]">
                                {name}
                            </h1>
                            <p className="text-lg font-bold tracking-[0.1em] uppercase text-indigo-500">
                                {description}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
                    
                    {/* LEFT METRICS */}
                    <div className="lg:col-span-5 border-r border-neutral-100 p-6 md:p-8 space-y-8 bg-neutral-50/30">
                        <TechMetric label="Operational.Cycle" value={experience} icon={<Cpu size={16} />} />
                        
                        <div className="space-y-4">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-800">Sub.Modules</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-neutral-200 text-neutral-900 text-[9px] uppercase font-black tracking-widest rounded hover:border-teal-400 transition-all cursor-default">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <TechMetric label="Signal.Interests" value={interests} icon={<Zap size={16} />} />

                        <div className="pt-6 border-t border-neutral-100 space-y-3">
                            <div className="flex items-center gap-2 text-[9px] font-black text-neutral-800 uppercase tracking-[0.1em]">
                                <Mail size={14} className="text-indigo-400" />
                                <span>{details.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-neutral-800 uppercase tracking-[0.1em]">
                                <MapPin size={14} className="text-teal-400" />
                                <span>{details.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT LOGS */}
                    <div className="lg:col-span-7 p-6 md:p-8 space-y-8 relative overflow-hidden bg-white">
                        <TechLog title="Root.Narrative" icon={<User size={16} />}>
                            <p className="text-lg text-neutral-950 font-medium tracking-tight whitespace-normal max-w-full">
                                {">"} {aboutYou}
                                <span className="inline-block w-2 h-5 bg-teal-400 ml-2 animate-pulse align-middle"></span>
                            </p>
                        </TechLog>

                        <div className="grid grid-cols-1 gap-8">
                            <TechLog title="Deployment.Logs" icon={<Briefcase size={16} />}>
                                <div className="text-sm text-neutral-900 leading-relaxed whitespace-pre-line border-l border-neutral-100 pl-4 py-1">
                                    {projects}
                                </div>
                            </TechLog>
                            <TechLog title="Core.Benchmarks" icon={<Award size={16} />}>
                                <div className="text-sm text-indigo-700 leading-relaxed whitespace-pre-line border-l border-indigo-100 pl-4 py-1 font-bold italic uppercase tracking-wider">
                                    {achievements}
                                </div>
                            </TechLog>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-indigo-500 flex justify-center items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Status: Protocol Synchronized</span>
                </div>
            </div>
        </div>
    );
}

const TechMetric = ({ label, value, icon }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <div className="text-teal-500">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-800 uppercase">{label}</span>
        </div>
        <p className="text-lg font-black text-neutral-950 tracking-tight">{value}</p>
    </div>
);

const TechLog = ({ title, icon, children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-50 text-indigo-500 rounded-lg border border-neutral-100 shadow-sm">
                {icon}
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-700 uppercase">{title}</h3>
        </div>
        <div className="pl-1">
            {children}
        </div>
    </div>
);

