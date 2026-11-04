import { Link, useLocation } from "react-router-dom";

// Shown for any URL that matches no route, instead of a blank page
export default function NotFoundPage() {
    const { pathname } = useLocation();

    return (
        <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center text-white px-6 pt-[90px] md:pt-0">
            <span className="text-[64px] md:text-[80px] font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                404
            </span>
            <h1 className="mt-4 text-[22px] font-black uppercase italic tracking-tighter">Page not found</h1>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-300 break-all">
                Nothing lives at <span className="text-ink-100">{pathname}</span>.
            </p>
            <div className="mt-8 flex gap-3">
                <Link
                    to="/home"
                    className="px-6 py-3 bg-white text-black text-[11px] font-black uppercase italic rounded-xl shadow-soft hover:bg-white/90 cliq-press focus-ring no-underline"
                >
                    Go to Feed
                </Link>
                <Link
                    to="/search"
                    className="px-6 py-3 border border-line text-white text-[11px] font-black uppercase italic rounded-xl hover:bg-white/5 hover:border-line-strong cliq-press focus-ring no-underline"
                >
                    Search
                </Link>
            </div>
        </div>
    );
}
