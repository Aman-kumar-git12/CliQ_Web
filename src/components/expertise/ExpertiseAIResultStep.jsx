/** Phase 2 of the AI Architect modal: review generated expertise and upload / regenerate / edit manually. */
import { Award, Briefcase, Check, Code, Info, Mail, MapPin, RotateCcw, Sparkles, Wand2, Zap } from "lucide-react";
import GeneratedDetailCard from "./GeneratedDetailCard";

const ExpertiseAIResultStep = ({ aiGeneratedData, aiGenerationSource, onUpload, onGenerateNew, onManualEdit }) => (
    <div className="space-y-8 animate-fadeIn">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-brand/[0.06]">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Generated Details
                    </p>
                    <h3 className="mt-2 text-3xl font-[1000] tracking-tight text-slate-900">
                        {aiGeneratedData.description || "Generated Expertise"}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                        Review the generated expertise details below. You can upload this result, generate a new one, or
                        switch to manual editing.
                    </p>
                </div>
                {aiGenerationSource === "fallback" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
                        <Info size={14} />
                        Safe Draft
                    </span>
                )}
            </div>

            {aiGenerationSource === "fallback" && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                    This draft was created from protected facts and fallback rules because the model output was not
                    reliable enough to use directly.
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <GeneratedDetailCard title="About You" icon={<User size={16} />} content={aiGeneratedData.aboutYou} />
                <GeneratedDetailCard
                    title="Experience"
                    icon={<Briefcase size={16} />}
                    content={aiGeneratedData.experience}
                />
                <GeneratedDetailCard title="Projects" icon={<Zap size={16} />} content={aiGeneratedData.projects} />
                <GeneratedDetailCard
                    title="Achievements"
                    icon={<Award size={16} />}
                    content={aiGeneratedData.achievements}
                />
                <GeneratedDetailCard title="Skills" icon={<Code size={16} />} skills={aiGeneratedData.skills} />
                <GeneratedDetailCard
                    title="Interests"
                    icon={<Sparkles size={16} />}
                    content={aiGeneratedData.interests}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <GeneratedDetailCard
                    title="Email"
                    icon={<Mail size={16} />}
                    content={aiGeneratedData.details?.email}
                    compact
                />
                <GeneratedDetailCard
                    title="Location"
                    icon={<MapPin size={16} />}
                    content={aiGeneratedData.details?.address}
                    compact
                />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
                onClick={onUpload}
                className="py-5 bg-brand hover:bg-brand/90 text-white font-black rounded-2xl shadow-xl shadow-brand/25 active:scale-[0.98] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center justify-center gap-3"
            >
                <Check size={22} className="stroke-[3]" />
                Upload
            </button>

            <button
                onClick={onGenerateNew}
                className="py-5 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm flex items-center justify-center gap-2 text-slate-700"
            >
                <RotateCcw size={16} />
                Generate New
            </button>

            <button
                onClick={onManualEdit}
                className="py-5 bg-slate-100 font-bold rounded-2xl hover:bg-slate-200 active:scale-[0.98] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm flex items-center justify-center gap-2 text-slate-900"
            >
                <Wand2 size={16} />
                Change Manually
            </button>
        </div>
    </div>
);

export default ExpertiseAIResultStep;
