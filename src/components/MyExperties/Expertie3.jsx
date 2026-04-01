import React from "react";
import { User, Briefcase, Award, Zap, Code, Mail, MapPin, Layers } from "lucide-react";

const safeValue = (val, fallback = "—") => {
    if (Array.isArray(val)) return val.length ? val : [fallback];
    return val || fallback;
};

export default function Experties3({ expertise = {} }) {
    const name = safeValue(expertise.name, "Minimalist Professional");
    const description = safeValue(expertise.description, "Strategic Lead");
    const experience = safeValue(expertise.experience);
    const skills = Array.isArray(expertise.skills) ? expertise.skills : [];
    const projects = safeValue(expertise.projects);
    const achievements = safeValue(expertise.achievements);
    const interests = safeValue(expertise.interests);
    const aboutYou = safeValue(expertise.aboutYou);
    const details = expertise.details || { email: "minimal@cliq.com", address: "Remote" };

    return (
        <div className="bg-[#FAF9F6] p-1 selection:bg-amber-100">
            <div className="w-full bg-white rounded-[2rem] shadow-[0_15px_60px_rgba(184,134,11,0.05)] border border-amber-100 font-sans p-6 md:p-8 space-y-10 relative overflow-hidden">
                
                {/* SOPHISTICATED MESH GLOWS */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-50/50 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neutral-100/50 rounded-full blur-[80px] pointer-events-none"></div>

                {/* MINIMALIST HEADER */}
                <header className="space-y-4 max-w-full relative z-10">
                    <div className="h-[2px] w-12 bg-amber-200"></div>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-[1000] tracking-tighter leading-[0.9] text-neutral-900 italic">
                            {name}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">
                            {description}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 relative z-10">
                    
                    {/* LEFT CONTENT */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-10">
                        <section className="space-y-4">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-800">Core.Identity</h4>
                            <p className="text-lg md:text-xl font-light text-neutral-950 leading-[1.3] max-w-full tracking-tight italic border-l-2 border-amber-50 pl-6">
                                "{aboutYou}"
                            </p>
                        </section>
 
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Section title="Strategic Output">
                                <div className="text-sm text-neutral-900 leading-relaxed whitespace-pre-line font-medium italic border-b border-amber-50 pb-4 h-full">
                                    {projects}
                                </div>
                            </Section>
                            <Section title="Metric Success">
                                <div className="text-sm text-neutral-900 leading-relaxed whitespace-pre-line font-medium border-b border-amber-50 pb-4 h-full">
                                    {achievements}
                                </div>
                            </Section>
                        </div>
                    </div>
 
                    {/* RIGHT SIDEBAR */}
                    <aside className="md:col-span-5 lg:col-span-4 space-y-10 group md:border-l md:border-amber-50 md:pl-8 lg:pl-12">
                        <Section title="Expertise Map">
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {skills.map((s, i) => (
                                    <span key={i} className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-800 border-b border-amber-50 hover:border-amber-400 transition-all cursor-default pb-0.5">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </Section>
 
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-8">
                            <Section title="Professional Duration">
                                <p className="text-xl font-light text-neutral-950 tracking-tight">{experience}</p>
                            </Section>
                            
                            <Section title="Curiosities">
                                <p className="text-[10px] text-neutral-900 font-medium leading-relaxed uppercase tracking-widest">{interests}</p>
                            </Section>
                        </div>
 
                        <div className="pt-8 border-t border-amber-100 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-900">
                                <Mail size={14} className="text-amber-600" />
                                <span>{details.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-900">
                                <MapPin size={14} className="text-amber-600" />
                                <span>{details.address}</span>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer className="pt-8 flex justify-between items-center border-t border-amber-100">
                    <div className="flex items-center gap-3 opacity-40">
                        <Layers size={14} className="text-neutral-900" />
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-900">Champagne Silk Profile</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

const Section = ({ title, children }) => (
    <div className="space-y-4 group/sec">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 opacity-60">
            {title}
        </h3>
        <div className="animate-fadeIn">
            {children}
        </div>
    </div>
);

