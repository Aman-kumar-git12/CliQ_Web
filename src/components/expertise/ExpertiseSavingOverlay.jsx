/** Full-screen "Synching Profile" overlay shown while expertise is being saved. */
const ExpertiseSavingOverlay = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-fadeIn">
        <div
            role="status"
            className="bg-white p-10 rounded-[32px] shadow-2xl shadow-slate-900/20 flex flex-col items-center gap-6 border border-slate-200"
        >
            <div className="relative">
                <div className="w-16 h-16 border-4 border-brand/15 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
                <p className="text-xl font-black tracking-tight text-slate-900">Synching Profile</p>
                <p className="text-sm text-slate-500 font-medium">Updating your global professional presence...</p>
            </div>
        </div>
    </div>
);

export default ExpertiseSavingOverlay;
