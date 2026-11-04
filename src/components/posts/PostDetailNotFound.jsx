/** Post detail page: "Post Not Found" fallback screen. */
import { useNavigate } from "react-router-dom";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "./postUi";

export default function PostDetailNotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-900 text-white p-4 relative overflow-hidden">
            {/* Ambient Background Glows for Not Found State */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-black mb-6 italic uppercase tracking-wider">Post Not Found</h2>
                <button
                    onClick={() => navigate("/")}
                    className={`px-8 py-3 bg-white text-black font-black uppercase text-[12px] tracking-widest rounded-full hover:bg-ink-100 shadow-soft-lg ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
