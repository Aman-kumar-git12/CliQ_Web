/** Post detail page: scrollbar-hiding style, ambient background glows and grid overlay. */
export default function PostDetailBackdrop() {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />

            {/* Cinematic Background Glows - Restored locally as Layout.jsx was reverted */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-pink/5 rounded-full blur-[140px] pointer-events-none z-0" />

            {/* Grid Overlay */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />
        </>
    );
}
