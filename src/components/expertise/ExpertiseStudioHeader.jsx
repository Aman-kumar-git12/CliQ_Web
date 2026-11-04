/** Sticky header of the Expertise Studio page: back button, Magic Builder and Save actions. */
import { RotateCcw, Save, Sparkles } from "lucide-react";

const ExpertiseStudioHeader = ({ onBack, onOpenAIModal, onSave }) => (
    <header className="sticky top-0 z-[100] w-full border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Back to profile"
                    onClick={onBack}
                    className="group rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition duration-150 ease-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    <RotateCcw
                        size={18}
                        className="transition-transform duration-200 ease-out group-hover:-rotate-45"
                    />
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
                    type="button"
                    onClick={onOpenAIModal}
                    className="group relative flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition duration-150 ease-out hover:border-brand/30 hover:bg-brand/5 hover:text-brand active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    <Sparkles
                        size={16}
                        className="text-brand transition-transform duration-200 ease-out group-hover:rotate-12"
                    />
                    <span className="hidden sm:inline">Magic Builder</span>
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold tracking-tight text-white shadow-lg shadow-slate-900/20 transition duration-150 ease-out active:scale-[0.97] hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                    <Save size={16} />
                    <span>Save Expertise</span>
                </button>
            </div>
        </div>
    </header>
);

export default ExpertiseStudioHeader;
