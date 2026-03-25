import React from "react";
import { Briefcase, Award, Code, Mail, MapPin, Star, Heart } from "lucide-react";

const safeValue = (val, fallback = "Not provided") => {
  if (Array.isArray(val)) return val.length ? val : [fallback];
  return val || fallback;
};

export default function Experties2({ expertise = {} }) {
  const name = safeValue(expertise.name, "Creative Talent");
  const description = safeValue(expertise.description, "Innovation Lead");
  const experience = safeValue(expertise.experience);
  const skills = Array.isArray(expertise.skills) ? expertise.skills : [];
  const projects = safeValue(expertise.projects);
  const achievements = safeValue(expertise.achievements);
  const interests = safeValue(expertise.interests);
  const aboutYou = safeValue(expertise.aboutYou);
  const details = expertise.details || { email: "creativity@cliq.com", address: "Global" };

  return (
    <div className="bg-white p-1 selection:bg-pink-100">
      <div className="w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-50/50 via-white to-pink-50/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative border border-white">
        
        {/* BACKGROUND GLOWS */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-200/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col">
          <aside className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 p-6 md:p-8 text-white relative overflow-hidden group/aside">
            {/* ANAMORPHIC GLOW */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-[60px] group-hover/aside:translate-x-10 group-hover/aside:translate-y-10 transition-transform duration-1000"></div>
            
            <div className="relative z-10 space-y-6">
                <div className="relative w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center text-3xl font-[1000] shadow-xl">
                  {name[0]}
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-[1000] tracking-tighter leading-[1.0]">{name}</h2>
                  <div className="inline-flex rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] backdrop-blur-md">
                    {description}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <SidebarDetail label="Market Influence" value={experience} icon={<Star size={14} />} />
                  <SidebarDetail label="Direct Channel" value={details.email} icon={<Mail size={14} />} />
                  <SidebarDetail label="HQ Location" value={details.address} icon={<MapPin size={14} />} />
                </div>
            </div>
          </aside>

          <main className="space-y-8 p-6 md:p-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-[2px] bg-indigo-100"></div>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Executive Summary</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-[1000] uppercase italic leading-[1.2] tracking-tighter text-neutral-900/90">
                {aboutYou}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-8">
                <Section title="Cognitive Stack" icon={<Code size={18} />}>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-lg bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-50 shadow-sm transition-all cursor-default"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </Section>

                <Section title="Strategic Visions" icon={<Heart size={18} />}>
                  <p className="text-base font-bold leading-relaxed text-neutral-500 max-w-full italic">{interests}</p>
                </Section>
              </div>

              <div className="space-y-8">
                <Section title="High-Impact Units" icon={<Briefcase size={18} />}>
                  <div className="rounded-[1.5rem] border border-neutral-100 bg-white/60 backdrop-blur-sm p-6 font-medium leading-relaxed text-neutral-600 transition-all relative group/card shadow-sm">
                    <div className="relative z-10 whitespace-pre-line">{projects}</div>
                  </div>
                </Section>

                <Section title="Benchmark Results" icon={<Award size={18} />}>
                  <div className="rounded-[1.5rem] border border-indigo-50 bg-indigo-50/30 p-6 font-bold italic leading-relaxed text-indigo-700 transition-all relative group/card shadow-sm">
                     <div className="relative z-10 whitespace-pre-line">{achievements}</div>
                  </div>
                </Section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const SidebarDetail = ({ label, value, icon }) => (
  <div className="space-y-1 group/item">
    <div className="flex items-center gap-2 opacity-70">
      <div>{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className="text-sm font-bold tracking-tight">{value}</p>
  </div>
);

const Section = ({ title, icon, children }) => (
  <section className="space-y-4 group/sec">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-100 text-indigo-500 shadow-sm transition-all duration-500">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{title}</h4>
    </div>
    <div className="pl-1 text-sm">{children}</div>
  </section>
);
