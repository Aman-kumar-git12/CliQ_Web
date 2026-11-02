import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Shared frame for the public legal pages (/privacy, /terms): readable on its own, logged in or out

/**
 * @param {{ title: string, effectiveDate: string, intro: import("react").ReactNode, children: import("react").ReactNode }} props
 */
export default function LegalPageLayout({ title, effectiveDate, intro, children }) {
    return (
        <div className="min-h-screen bg-black text-white px-4 py-10 md:py-16">
            <div className="mx-auto w-full max-w-2xl">
                {/* "/" sends logged-out visitors to signup and logged-in users to their feed */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-[12px] font-bold text-brand-light hover:text-white transition-colors no-underline"
                >
                    <ArrowLeft size={14} /> Back to CliQ
                </Link>

                <header className="mt-8 mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                        CliQ Legal
                    </span>
                    <h1 className="mt-2 text-[32px] md:text-[40px] font-black tracking-tighter uppercase italic leading-none">
                        {title}
                    </h1>
                    <p className="mt-3 text-[12px] text-ink-300">Effective date: {effectiveDate}</p>
                    <div className="mt-6 text-[14px] leading-relaxed text-white/75">{intro}</div>
                </header>

                <div className="flex flex-col gap-8">{children}</div>

                <footer className="mt-14 pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-300">
                    <span>© {new Date().getFullYear()} CliQ</span>
                    <Link to="/privacy" className="hover:text-white transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="hover:text-white transition-colors">
                        Terms of Service
                    </Link>
                </footer>
            </div>
        </div>
    );
}

/**
 * One numbered section of a legal page.
 * @param {{ title: string, children: import("react").ReactNode }} props
 */
export function LegalSection({ title, children }) {
    return (
        <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 md:p-6">
            <h2 className="text-[15px] font-black uppercase tracking-[0.08em] text-white">{title}</h2>
            <div className="mt-3 flex flex-col gap-3 text-[14px] leading-relaxed text-white/70 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-white/90 [&_a]:text-brand-light [&_a]:underline">
                {children}
            </div>
        </section>
    );
}
