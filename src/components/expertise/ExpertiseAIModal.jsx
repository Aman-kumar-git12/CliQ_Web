/** Shell of the "AI Architect" modal (backdrop, header with phase badge, scrollable body). */
import { Wand2, X } from "lucide-react";

const ExpertiseAIModal = ({ aiStage, onClose, children }) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-architect-title"
            className="relative bg-gradient-to-b from-white to-slate-50 w-full max-w-2xl rounded-[32px] shadow-2xl shadow-brand/20 overflow-hidden flex flex-col max-h-[90vh] border border-brand/10 animate-fadeIn"
        >
            <div className="p-12 border-b border-slate-200 flex items-center justify-between bg-white/90 sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <div className="relative group/wand">
                        <div className="absolute -inset-4 bg-gradient-to-r from-brand to-brand-pink rounded-full blur-2xl opacity-20 group-hover/wand:opacity-40 transition-opacity duration-300 ease-out"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-brand to-brand-pink rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand/30">
                            <Wand2 size={40} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h2 id="ai-architect-title" className="text-4xl font-[1000] tracking-tighter text-slate-900">
                            AI Architect
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 rounded-full border border-brand/20">
                                <div
                                    className={`w-2 h-2 rounded-full ${aiStage === 1 ? "bg-brand motion-safe:animate-pulse" : "bg-emerald-500"}`}
                                ></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand">
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
                    className="p-3 hover:bg-slate-100 rounded-2xl transition duration-150 ease-out text-slate-400 hover:text-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-8 scrollbar-hide">{children}</div>
        </div>
    </div>
);

export default ExpertiseAIModal;
