/** Full-screen "Synching Profile" overlay shown while expertise is being saved. */
const ExpertiseSavingOverlay = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-slate-200 dark:border-slate-800 animate-scaleUp">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
                <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Synching Profile</p>
                <p className="text-sm text-slate-500 font-medium">Updating your global professional presence...</p>
            </div>
        </div>
    </div>
);

export default ExpertiseSavingOverlay;
