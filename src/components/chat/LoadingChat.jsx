// Chat thread skeleton (header, message bubbles, composer) shown while a conversation's code or history loads,
// including when switching to another chat. Same frame as ChatPage, ChatHeader and ChatComposer.
const Shine = () => <div className="absolute inset-0 shine-effect motion-reduce:hidden" />;

const BUBBLES = [
    { side: "left", width: "max-w-[70%]", height: "h-14" },
    { side: "right", width: "max-w-[70%]", height: "h-20" },
    { side: "left", width: "max-w-[50%]", height: "h-12" },
    { side: "right", width: "max-w-[60%]", height: "h-14" },
    { side: "left", width: "max-w-[80%]", height: "h-24" },
];

const LoadingChat = () => {
    return (
        <div
            role="status"
            aria-label="Loading conversation"
            aria-busy="true"
            className="h-full bg-surface-950 text-white flex flex-col overflow-hidden"
        >
            {/* Header Skeleton - Matches ChatHeader */}
            <div className="flex items-center justify-between pl-2 pr-6 py-4 h-[88px] bg-surface-900/70 backdrop-blur-2xl border-b border-line-soft shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 mr-2 rounded-full bg-white/5" />
                    <div className="flex items-center gap-4">
                        <div className="w-[56px] h-[56px] rounded-[22px] bg-white/10 overflow-hidden relative">
                            <Shine />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-32 h-5 bg-white/10 rounded-lg relative overflow-hidden">
                                <Shine />
                            </div>
                            <div className="w-20 h-3 bg-white/5 rounded-md relative overflow-hidden">
                                <Shine />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area Skeleton */}
            <div className="flex-1 px-5 py-4 md:px-7 space-y-5 overflow-hidden">
                {BUBBLES.map(({ side, width, height }, index) =>
                    side === "left" ? (
                        <div key={index} className={`flex flex-col gap-2 ${width}`}>
                            <div
                                className={`${height} w-full bg-white/[0.05] rounded-[20px] rounded-bl-md relative overflow-hidden`}
                            >
                                <Shine />
                            </div>
                            <div className="w-12 h-2.5 bg-white/5 rounded-full self-start" />
                        </div>
                    ) : (
                        <div key={index} className={`flex flex-col gap-2 ${width} ml-auto items-end`}>
                            <div
                                className={`${height} w-full bg-gradient-to-br from-brand/15 to-brand-pink/10 rounded-[20px] rounded-br-md relative overflow-hidden`}
                            >
                                <Shine />
                            </div>
                            <div className="w-12 h-2.5 bg-white/5 rounded-full self-end" />
                        </div>
                    ),
                )}
            </div>

            {/* Footer Input Bar Skeleton - Matches ChatComposer */}
            <div className="shrink-0 pt-3 pb-[calc(env(safe-area-inset-bottom)+24px)] px-2 bg-surface-900/75 backdrop-blur-2xl border-t border-line-soft">
                <div className="flex items-center gap-1 md:gap-1.5 w-full">
                    <div className="w-[44px] h-[44px] rounded-full bg-white/5 shrink-0 relative overflow-hidden">
                        <Shine />
                    </div>
                    <div className="flex-1 h-14 bg-ios-gray/90 rounded-[26px] border border-line-soft relative overflow-hidden">
                        <Shine />
                    </div>
                    <div className="w-[48px] h-[48px] rounded-full bg-ios-gray shrink-0 relative overflow-hidden">
                        <Shine />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingChat;
