import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Shared frame for the public legal pages (/privacy, /terms): readable on its own, logged in or out

/**
 * @param {{ title: string, effectiveDate: string, intro: import("react").ReactNode, children: import("react").ReactNode }} props
 */
export default function LegalPageLayout({ title, effectiveDate, intro, children }) {
    return (
        <div className="min-h-screen bg-surface-950 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.07),transparent_55%)] text-white px-4 py-10 md:py-16">
            <div className="mx-auto w-full max-w-2xl">
                {/* "/" sends logged-out visitors to signup and logged-in users to their feed */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-md text-[12px] font-bold text-brand-light hover:text-white cliq-transition focus-ring no-underline group"
                >
                    <ArrowLeft size={14} className="cliq-transition group-hover:-translate-x-0.5" /> Back to CliQ
                </Link>

                <header className="mt-8 mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                        CliQ Legal
                    </span>
                    <h1 className="mt-2 text-[32px] md:text-[40px] font-black tracking-tighter uppercase italic leading-none">
                        {title}
                    </h1>
                    <p className="mt-3 text-[12px] text-ink-300">Effective date: {effectiveDate}</p>
                    <div className="mt-6 text-[15px] leading-relaxed text-ink-200">{intro}</div>
                </header>

                <div className="flex flex-col gap-8">{children}</div>

                <footer className="mt-14 pt-6 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-300">
                    <span>© {new Date().getFullYear()} CliQ</span>
                    <Link to="/privacy" className="rounded-sm hover:text-white cliq-transition focus-ring">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="rounded-sm hover:text-white cliq-transition focus-ring">
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
        <section className="rounded-3xl border border-line-soft bg-white/[0.025] shadow-hairline p-5 md:p-6">
            <h2 className="text-[15px] font-black uppercase tracking-[0.08em] text-white">{title}</h2>
            <div className="mt-3 flex flex-col gap-3 text-[14px] leading-7 text-ink-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li::marker]:text-ink-400 [&_strong]:text-ink-100 [&_a]:text-brand-light [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-white">
                {children}
            </div>
        </section>
    );
}
