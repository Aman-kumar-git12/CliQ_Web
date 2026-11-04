import { Component } from "react";
import { reportError } from "../../utils/monitoring";

// Catches a crash in any page below it and shows a recovery screen instead of blanking the whole app.
// App gives it key={pathname}, so moving to another page starts fresh.
export default class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("Page crashed:", error, info.componentStack);
        reportError(error, { componentStack: info.componentStack });
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center text-ink-100 px-6 pt-[90px] md:pt-0 animate-in fade-in duration-300">
                <h1 className="text-[22px] font-black uppercase italic tracking-tighter">Something went wrong</h1>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-300">
                    This page hit an unexpected error. Reloading usually fixes it.
                </p>
                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-ink-100 text-surface-900 text-[11px] font-black uppercase italic rounded-xl shadow-soft hover:bg-white cliq-press"
                    >
                        Reload
                    </button>
                    <a
                        href="/home"
                        className="px-6 py-3 border border-line text-ink-100 text-[11px] font-black uppercase italic rounded-xl hover:bg-white/[0.05] hover:border-line-strong cliq-press no-underline"
                    >
                        Go to Feed
                    </a>
                </div>
            </div>
        );
    }
}
