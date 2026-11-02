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
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center text-white px-6 pt-[90px] md:pt-0">
                <h1 className="text-[22px] font-black uppercase italic tracking-tighter">Something went wrong</h1>
                <p className="mt-2 max-w-sm text-[13px] text-ink-450">
                    This page hit an unexpected error. Reloading usually fixes it.
                </p>
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-white text-black text-[11px] font-black uppercase italic rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Reload
                    </button>
                    <a
                        href="/home"
                        className="px-6 py-3 border border-white/10 text-white text-[11px] font-black uppercase italic rounded-xl hover:bg-white/5 transition-all no-underline"
                    >
                        Go to Feed
                    </a>
                </div>
            </div>
        );
    }
}
