import { lazy, Suspense } from "react";

// emoji-picker-react is ~300 KB, so it is downloaded only the first time someone opens a picker
const Picker = lazy(() => import("emoji-picker-react"));

/** Lazy drop-in for emoji-picker-react's default export; takes the same props. */
export default function EmojiPicker(props) {
    return (
        <Suspense
            fallback={
                <div className="h-[350px] w-[300px] rounded-xl bg-surface-700 border border-line-soft shadow-pop motion-safe:animate-pulse" />
            }
        >
            <Picker {...props} />
        </Suspense>
    );
}
