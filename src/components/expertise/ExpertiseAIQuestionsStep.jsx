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
    <div className="space-y-10 animate-slideUp">
        <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 flex gap-4">
            <div className="p-2.5 bg-white dark:bg-indigo-950 rounded-xl shrink-0 h-fit text-indigo-500 shadow-sm border border-indigo-50 dark:border-indigo-900/30">
                <Zap size={20} />
            </div>
            <div>
                <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">Intelligent Generation</h4>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
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
                        <Code size={14} className="text-indigo-500" />
                        Focus Areas
                    </label>
                    <button
                        onClick={() => setSeeMoreInterests(!seeMoreInterests)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
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
                        onClick={() => setSeeMoreSkills(!seeMoreSkills)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
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
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[20px] shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
            {isGeneratingAI ? (
                <>
                    <div className="w-5 h-5 border-3 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-tight italic">Drafting your profile...</span>
                </>
            ) : (
                <>
                    <span className="tracking-tight">Generate Professional Profile</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
    </div>
);

export default ExpertiseAIQuestionsStep;
