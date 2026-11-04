/** Phase 1 of the AI Architect modal: narrative, focus-area and technology inputs plus the generate button. */
import { ChevronRight, Code, User, Zap } from "lucide-react";
import AITextArea from "./AITextArea";
import PillButton from "./PillButton";
import { FOCUS_AREAS_ALL, FOCUS_AREAS_FEATURED, TECHNOLOGIES_ALL, TECHNOLOGIES_FEATURED } from "./constants";

const ExpertiseAIQuestionsStep = ({
    aiAnswers,
    setAiAnswers,
    seeMoreInterests,
    setSeeMoreInterests,
    seeMoreSkills,
    setSeeMoreSkills,
    isGeneratingAI,
    onGenerate,
}) => (
    <div className="space-y-10 animate-fadeIn">
        <div className="bg-brand/5 p-6 rounded-3xl border border-brand/15 flex gap-4">
            <div className="p-2.5 bg-white rounded-xl shrink-0 h-fit text-brand shadow-sm border border-brand/10">
                <Zap size={20} />
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-900">Intelligent Generation</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Our AI analyzes your input to craft a high-impact professional narrative. Provide clear details for
                    the best results.
                </p>
            </div>
        </div>

        <div className="space-y-8">
            <AITextArea
                label="Your Professional Narrative"
                value={aiAnswers.about}
                onChange={(v) => setAiAnswers({ ...aiAnswers, about: v })}
                placeholder="e.g. I'm a senior architect specializing in scalable microservices..."
                icon={<User size={14} />}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Code size={14} className="text-brand" />
                        Focus Areas
                    </label>
                    <button
                        type="button"
                        onClick={() => setSeeMoreInterests(!seeMoreInterests)}
                        className="rounded-md text-xs font-bold text-brand hover:text-brand-light transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                        {seeMoreInterests ? "See Less" : "Explore All"}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    {(seeMoreInterests ? FOCUS_AREAS_ALL : FOCUS_AREAS_FEATURED).map((topic) => (
                        <PillButton
                            key={topic}
                            active={aiAnswers.interests?.includes(topic)}
                            onClick={() => {
                                const current = aiAnswers.interests ? aiAnswers.interests.split(", ") : [];
                                const next = current.includes(topic)
                                    ? current.filter((t) => t !== topic)
                                    : [...current, topic];
                                setAiAnswers({ ...aiAnswers, interests: next.join(", ") });
                            }}
                            label={topic}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Key Technologies
                    </label>
                    <button
                        type="button"
                        onClick={() => setSeeMoreSkills(!seeMoreSkills)}
                        className="rounded-md text-xs font-bold text-amber-600 hover:text-amber-500 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                        {seeMoreSkills ? "See Less" : "Explore All"}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    {(seeMoreSkills ? TECHNOLOGIES_ALL : TECHNOLOGIES_FEATURED).map((skill) => (
                        <PillButton
                            key={skill}
                            color="amber"
                            active={aiAnswers.skills?.includes(skill)}
                            onClick={() => {
                                const current = aiAnswers.skills ? aiAnswers.skills.split(", ") : [];
                                const next = current.includes(skill)
                                    ? current.filter((s) => s !== skill)
                                    : [...current, skill];
                                setAiAnswers({ ...aiAnswers, skills: next.join(", ") });
                            }}
                            label={skill}
                        />
                    ))}
                </div>
            </div>
        </div>

        <button
            onClick={onGenerate}
            disabled={isGeneratingAI}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-[20px] shadow-xl shadow-slate-900/15 hover:shadow-brand/20 enabled:active:scale-[0.98] transition duration-150 ease-out disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
            {isGeneratingAI ? (
                <>
                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-tight italic">Drafting your profile...</span>
                </>
            ) : (
                <>
                    <span className="tracking-tight">Generate Professional Profile</span>
                    <ChevronRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform duration-150 ease-out"
                    />
                </>
            )}
        </button>
    </div>
);

export default ExpertiseAIQuestionsStep;
