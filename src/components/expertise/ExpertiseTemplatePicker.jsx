/** "Blueprint Gallery" card: live mini previews of the 4 expertise layouts to pick from. */
import { Check, LayoutTemplate } from "lucide-react";
import ExpertiseView from "./ExpertiseView";
import { EXPERTISE_TEMPLATES } from "./constants";

const ExpertiseTemplatePicker = ({ selectedFormat, onSelectFormat, expertiseDraft }) => (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl">
        <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Blueprint Gallery</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <LayoutTemplate size={14} /> 04 Templates
            </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 backdrop-blur-md">
            <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl bg-slate-900 p-2.5 text-white shadow-md">
                    <LayoutTemplate size={16} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-black tracking-tight text-slate-900">Choose a layout</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                        Smaller cards, same 4 templates. The selected format will be used when you save.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {EXPERTISE_TEMPLATES.map((tpl) => (
                    <button
                        type="button"
                        key={tpl.id}
                        onClick={() => onSelectFormat(tpl.id)}
                        aria-pressed={selectedFormat === tpl.id}
                        className={`relative group flex flex-col overflow-hidden rounded-[22px] border transition duration-200 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                            selectedFormat === tpl.id
                                ? "border-slate-900 bg-white shadow-xl shadow-slate-900/10"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5"
                        }`}
                    >
                        <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-200 bg-white">
                            <div className="absolute inset-0 origin-top-left scale-[0.17] h-[588%] w-[588%] pointer-events-none opacity-70 transition-opacity duration-200 ease-out group-hover:opacity-100">
                                <ExpertiseView expertise={{ ...expertiseDraft, format: tpl.id }} />
                            </div>
                            {selectedFormat === tpl.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl animate-fadeIn">
                                        <Check size={20} className="stroke-[3]" />
                                    </div>
                                </div>
                            )}
                            <div
                                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tpl.color} opacity-70`}
                            />
                        </div>
                        <div className="flex items-center justify-between px-3 py-3">
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Template 0{tpl.id}
                                </p>
                                <p
                                    className={`mt-1 text-sm font-bold ${selectedFormat === tpl.id ? "text-slate-950" : "text-slate-700"}`}
                                >
                                    {tpl.name}
                                </p>
                            </div>
                            {selectedFormat === tpl.id && (
                                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                    Active
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default ExpertiseTemplatePicker;
