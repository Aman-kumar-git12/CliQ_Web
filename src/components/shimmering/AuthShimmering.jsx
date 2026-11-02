// Auth screens while their code (or the session check) loads.
// "form": the Login / Signup layout (big two-line greeting above a narrow form).
// "card": the centred card of Verify Email / Verify OTP / Blocked Account.
const AuthShimmering = ({ variant = "form" }) => {
    if (variant === "card") {
        return (
            <div
                role="status"
                aria-label="Loading"
                aria-busy="true"
                className="min-h-screen bg-black text-white flex items-center justify-center px-4"
            >
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl motion-safe:animate-pulse">
                    <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-white/10"></div>
                    <div className="mx-auto h-7 w-56 max-w-full rounded-lg bg-white/15 mb-4"></div>
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="h-3 w-full rounded-full bg-white/5"></div>
                        <div className="h-3 w-3/4 rounded-full bg-white/5"></div>
                    </div>
                    <div className="mt-8 h-12 w-full rounded-full bg-white/10"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label="Loading"
            aria-busy="true"
            className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 motion-safe:animate-pulse"
        >
            <div className="flex flex-col items-center gap-3 mb-10">
                <div className="h-9 sm:h-12 w-64 sm:w-80 rounded-xl bg-white/15"></div>
                <div className="h-9 sm:h-12 w-44 sm:w-56 rounded-xl bg-white/10"></div>
            </div>

            <div className="w-full max-w-sm space-y-5">
                <div className="flex justify-between items-center">
                    <div className="h-7 w-36 rounded-lg bg-white/15"></div>
                    <div className="h-3.5 w-28 rounded-full bg-white/10"></div>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[42px] w-full rounded border border-gray-600/60 flex items-center px-3">
                        <div className="h-4 w-4 rounded bg-white/10 mr-2"></div>
                        <div className="h-3 w-28 rounded-full bg-white/5"></div>
                    </div>
                ))}
                <div className="h-12 w-full rounded-full bg-white/20"></div>
                <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-white/10" />
                    <div className="h-2.5 w-6 rounded-full bg-white/10"></div>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="h-10 w-full rounded-full bg-white/10"></div>
            </div>
        </div>
    );
};

export default AuthShimmering;
