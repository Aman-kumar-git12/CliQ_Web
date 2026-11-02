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
            className="h-full bg-[#040406] text-white flex flex-col overflow-hidden"
        >
            {/* Header Skeleton - Matches ChatHeader */}
            <div className="flex items-center justify-between pl-2 pr-6 py-4 h-[88px] bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 mr-2 rounded-full bg-white/5" />
                    <div className="flex items-center gap-4">
                        <div className="w-[56px] h-[56px] rounded-[24px] bg-white/10 overflow-hidden relative">
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
            <div className="flex-1 p-4 md:px-6 space-y-6 overflow-hidden">
                {BUBBLES.map(({ side, width, height }, index) =>
                    side === "left" ? (
                        <div key={index} className={`flex flex-col gap-2 ${width}`}>
                            <div
                                className={`${height} w-full bg-white/5 rounded-[24px] rounded-bl-none relative overflow-hidden`}
                            >
                                <Shine />
                            </div>
                            <div className="w-12 h-2.5 bg-white/5 rounded-full self-start" />
                        </div>
                    ) : (
                        <div key={index} className={`flex flex-col gap-2 ${width} ml-auto items-end`}>
                            <div
                                className={`${height} w-full bg-gradient-to-r from-white/10 to-white/5 rounded-[24px] rounded-br-none relative overflow-hidden`}
                            >
                                <Shine />
                            </div>
                            <div className="w-12 h-2.5 bg-white/5 rounded-full self-end" />
                        </div>
                    ),
                )}
            </div>

            {/* Footer Input Bar Skeleton - Matches ChatComposer */}
            <div className="shrink-0 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)] px-2 bg-white/[0.03] backdrop-blur-3xl border-t border-white/10">
                <div className="flex items-center gap-1 w-full">
                    <div className="w-[44px] h-[44px] rounded-full bg-white/5 shrink-0 relative overflow-hidden">
                        <Shine />
                    </div>
                    <div className="flex-1 h-12 bg-white/5 rounded-[24px] border border-white/10 relative overflow-hidden">
                        <Shine />
                    </div>
                    <div className="w-[44px] h-[44px] rounded-full bg-white/10 shrink-0 relative overflow-hidden">
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
