/** Shell of the "AI Architect" modal (backdrop, header with phase badge, scrollable body). */
import { Wand2, X } from "lucide-react";

const ExpertiseAIModal = ({ aiStage, onClose, children }) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl animate-fadeIn" onClick={onClose}></div>
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-architect-title"
            className="relative bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] w-full max-w-2xl rounded-[40px] shadow-[0_30px_100px_rgba(79,70,229,0.18)] overflow-hidden flex flex-col max-h-[90vh] border border-indigo-100 animate-scaleUp"
        >
            <div className="p-12 border-b border-slate-200 flex items-center justify-between bg-white/90 sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <div className="relative group/wand">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover/wand:opacity-50 transition-opacity"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                            <Wand2 size={40} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h2 id="ai-architect-title" className="text-4xl font-[1000] tracking-tighter text-slate-900">
                            AI Architect
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                <div
                                    className={`w-2 h-2 rounded-full ${aiStage === 1 ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`}
                                ></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    Phase 0{aiStage}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-700 active:rotate-90"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">{children}</div>
        </div>
    </div>
);

export default ExpertiseAIModal;
