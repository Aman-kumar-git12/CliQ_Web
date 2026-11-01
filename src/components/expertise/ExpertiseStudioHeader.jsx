/** Sticky header of the Expertise Studio page: back button, Magic Builder and Save actions. */
import { RotateCcw, Save, Sparkles } from "lucide-react";

const ExpertiseStudioHeader = ({ onBack, onOpenAIModal, onSave }) => (
    <header className="sticky top-0 z-[100] w-full border-b border-black/5 bg-white/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Back to profile"
                    onClick={onBack}
                    className="group rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900"
                >
                    <RotateCcw size={18} className="transition-transform group-hover:-rotate-45" />
                </button>
                <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                        Profile Builder
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-slate-950">Expertise Studio</h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenAIModal}
                    className="group relative flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                    <Sparkles size={16} className="text-indigo-500 transition-transform group-hover:rotate-12" />
                    <span className="hidden sm:inline">Magic Builder</span>
                </button>
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold tracking-tight text-white shadow-lg transition-all active:scale-95 hover:bg-slate-800"
                >
                    <Save size={16} />
                    <span>Save Expertise</span>
                </button>
            </div>
        </div>
    </header>
);

export default ExpertiseStudioHeader;
