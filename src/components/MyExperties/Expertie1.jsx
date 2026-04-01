import React from "react";
import { User, Briefcase, Award, Zap, Code, Mail, MapPin, Globe } from "lucide-react";

const safeValue = (val, fallback = "Not provided") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    return val || fallback;
};

export default function Expertise1({ expertise = {} }) {
    const name = safeValue(expertise.name, "Professional Name");
    const description = safeValue(expertise.description, "Expertise Title");
    const experience = safeValue(expertise.experience);
    const skills = Array.isArray(expertise.skills) ? expertise.skills : [];
    const projects = safeValue(expertise.projects);
    const achievements = safeValue(expertise.achievements);
    const interests = safeValue(expertise.interests);
    const aboutYou = safeValue(expertise.aboutYou);
    const details = expertise.details || { email: "no-email@cliq.com", address: "Remote" };

    return (
        <div className="bg-[#FDFDFD] p-1 selection:bg-indigo-100">
            <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-neutral-100 font-sans relative">
                
                {/* SUBTLE GRADIENT BLOBS */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50/30 rounded-full blur-[100px] pointer-events-none"></div>

                {/* HERO SECTION */}
                <div className="relative p-6 md:p-8 pb-10 border-b border-neutral-50 bg-gradient-to-b from-neutral-50/50 to-transparent">
                    <div className="max-w-full mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-800 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-neutral-200">
                           <Zap size={8} className="text-indigo-500" /> Digital Architecture
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-[1000] tracking-tight text-neutral-900 leading-[1.1]">
                                {name}
                            </h1>
                            <p className="text-lg md:text-xl font-bold text-indigo-600 tracking-tight max-w-2xl">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 md:px-8 pt-8 pb-10 grid grid-cols-1 gap-8 relative z-10">
                    
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-12 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="w-6 h-[2px] bg-indigo-500/20"></div>
                               <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-800">The Narrative</h2>
                            </div>
                            <p className="text-lg md:text-xl leading-[1.5] text-neutral-900 font-medium max-w-full tracking-tight">
                                "{aboutYou}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <Section title="Strategic Projects" icon={<Briefcase size={16} />}>
                                <div className="text-sm leading-relaxed text-neutral-900 font-medium whitespace-pre-line">
                                    {projects}
                                </div>
                            </Section>
                            <Section title="Key Accomplishments" icon={<Zap size={16} />}>
                                <div className="text-sm leading-relaxed text-neutral-900 font-medium whitespace-pre-line">
                                    {achievements}
                                </div>
                            </Section>
                        </div>

                        {/* BOTTOM GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-100">
                            <Section title="Pulse" icon={<Award size={14} />} compact>
                                <p className="text-neutral-900 font-bold text-lg tracking-tight">{experience}</p>
                            </Section>
                            
                            <Section title="Engine" icon={<Code size={14} />} compact>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {skills.map((s, i) => (
                                        <span key={i} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-neutral-50 text-neutral-900 rounded-lg border border-neutral-200 hover:border-indigo-300 transition-all cursor-default">
                                            {s.trim()}
                                        </span>
                                    ))}
                                </div>
                            </Section>

                            <Section title="Intelligence" icon={<Globe size={14} />} compact>
                                <div className="space-y-3">
                                    <p className="text-neutral-900 text-[12px] font-medium leading-relaxed">{interests}</p>
                                    <div className="pt-2 space-y-2">
                                        <div className="flex items-center gap-2 text-neutral-900 text-[10px] font-bold tracking-widest uppercase">
                                            <Mail size={12} className="text-indigo-500" />
                                            <span>{details.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-900 text-[10px] font-bold tracking-widest uppercase">
                                            <MapPin size={12} className="text-purple-500" />
                                            <span>{details.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Section = ({ title, icon, children, compact = false }) => (
    <div className="space-y-3 group">
        <div className={`flex items-center gap-3 ${compact ? "" : "mb-2"}`}>
            <div className={`flex items-center justify-center p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-indigo-500 transition-all duration-500 shadow-sm ${compact ? "w-8 h-8 p-1.5" : "w-11 h-11"}`}>
                {React.cloneElement(icon, { size: compact ? 14 : 20 })}
            </div>
            <h3 className={`font-black uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-900 transition-colors ${compact ? "text-[8px]" : "text-[10px]"}`}>
                {title}
            </h3>
        </div>
        <div className={`${compact ? "" : "pl-1"}`}>
            {children}
        </div>
    </div>
);
