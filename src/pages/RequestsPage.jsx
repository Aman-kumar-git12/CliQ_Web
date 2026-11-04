import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as connectionsApi from "../api/connections";
import ConfirmDialog from "../components/common/ConfirmDialog";
import RequestsShimmering from "../components/shimmering/RequestsShimmering";
import Toastbar from "../components/chat/Toastbar";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { UserPlus, UserMinus, UserCheck, Inbox, Bell, Zap } from "lucide-react";
import ProfileHoverCard from "../components/profile/ProfileHoverCard";
import { useNotifications } from "../context/NotificationContext";
import { invalidateCachedRequests } from "../utils/requestCache";

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshPendingRequests } = useNotifications();
    const [toast, setToast] = useState(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null,
        requestId: null,
        userId: null,
    });

    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [hoverUserId, setHoverUserId] = useState(null);

    useEffect(() => {
        const controller = new AbortController(); // an older reload must not overwrite a newer one
        const fetchAllRequests = async () => {
            try {
                const data = await connectionsApi.getConnectionRequests({ signal: controller.signal });

                // Using the optimized backend data that already includes 'fromUser'
                const sortedRequests = (data.connectionRequests || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                );

                setRequests(sortedRequests);
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error("Error fetching requests:", err);
            }
            setLoading(false);
        };

        fetchAllRequests();
        return () => controller.abort();
    }, []);

    const openConfirmation = (userId, status, requestId) => {
        setConfirmation({
            isOpen: true,
            type: status,
            userId: userId,
            requestId: requestId,
        });
    };

    const confirmReview = async () => {
        if (!confirmation.userId || !confirmation.type || !confirmation.requestId) return;
        const { userId, type, requestId } = confirmation;

        try {
            await connectionsApi.reviewConnectionRequest(type, requestId, { silent: true });
            // The answered request just leaves the list (no reload of the whole list); the nav badge updates too
            setRequests((prev) => prev.filter((req) => req.fromUserId !== userId));
            refreshPendingRequests();
            invalidateCachedRequests(`hover-card:${userId}`);
            setToast(type === "accepted" ? "Connection Request Accepted" : "Connection Request Rejected");
        } catch (err) {
            console.error(err);
            setToast("Something went wrong. Please try again.");
        } finally {
            setConfirmation({ isOpen: false, type: null, requestId: null, userId: null });
        }
    };

    const handleProfileMouseEnter = (e, userId) => {
        setHoverAnchorRect(e.currentTarget.getBoundingClientRect());
        setHoverUserId(userId);
        setShowHoverCard(true);
    };

    if (loading) return <RequestsShimmering />;

    return (
        <MotionConfig reducedMotion="user">
            <div className="w-full min-h-screen relative overflow-x-hidden pt-24 md:pt-12 bg-transparent">
                {/* Cinematic Background Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/10 rounded-full blur-[140px] pointer-events-none -z-10" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-pink/5 rounded-full blur-[140px] pointer-events-none -z-10" />

                <div className="px-4 md:px-0 max-w-full md:max-w-2xl mx-auto w-full pb-32">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
                    >
                        <div className="w-full max-w-full md:max-w-2xl mx-auto flex flex-col items-start justify-start relative z-10">
                            <div className="flex items-center justify-between w-full mb-1">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="fill-brand/20 text-brand" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                                        Discovery Module
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-row items-end justify-between w-full mb-6">
                                <div className="flex flex-col">
                                    <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                                        Connection
                                    </h1>
                                    <span className="text-[22px] md:text-[26px] text-ink-300 font-light uppercase italic leading-none -mt-1 block">
                                        Requests{" "}
                                        <span className="text-ink-300 font-light not-italic font-sans">
                                            / {requests.length}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start md:items-center gap-4">
                                <h2 className="text-[10px] md:text-[11px] font-black text-ink-300 uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-start md:items-center gap-2 leading-relaxed">
                                    <Bell size={12} className="text-brand-light/80 mt-0.5 md:mt-0 shrink-0" />
                                    <span>People who want to connect with you</span>
                                </h2>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-ink-300 uppercase tracking-[0.4em] mb-2">
                                Security Status
                            </span>
                            <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full motion-safe:animate-pulse shadow-md shadow-emerald-500/50" />
                                <span className="text-xs font-black text-white/70 uppercase tracking-widest">
                                    End-to-End Secure
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                        {requests.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="w-full flex flex-col items-center justify-center text-center py-20 md:py-24 rounded-[28px] bg-white/[0.02] border border-line-soft backdrop-blur-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
                                <div className="relative mb-6">
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="absolute inset-0 bg-brand rounded-full blur-3xl"
                                    />
                                    <div className="relative w-20 h-20 rounded-2xl bg-white/[0.03] border border-line flex items-center justify-center shadow-soft-lg rotate-3">
                                        <Inbox size={36} className="text-brand-light/50" />
                                    </div>
                                </div>
                                <h3 className="text-[22px] font-black text-white tracking-tighter uppercase italic mb-1">
                                    No pending requests
                                </h3>
                                <p className="text-ink-300 max-w-sm text-xs font-medium uppercase tracking-widest">
                                    Your connection queue is currently clear.
                                </p>

                                <Link
                                    to="/search"
                                    className="mt-8 px-6 py-3.5 bg-white text-black text-[11px] font-black uppercase italic rounded-xl hover:bg-white/90 cliq-press shadow-lg shadow-white/10 focus-ring"
                                >
                                    Discover People
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div key="list" className="flex flex-col gap-4">
                                <AnimatePresence initial={false}>
                                    {requests.map((req) => (
                                        <motion.div
                                            layout="position"
                                            key={req.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 24, transition: { duration: 0.2, ease: "easeOut" } }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            className="group relative"
                                        >
                                            <div className="absolute -inset-px bg-gradient-to-r from-brand to-brand-pink rounded-[22px] opacity-0 group-hover:opacity-10 transition-opacity duration-250 ease-soft blur-lg" />
                                            <div className="relative p-3.5 md:p-5 rounded-[20px] md:rounded-[22px] border border-line-soft bg-white/[0.03] flex flex-row justify-between items-center gap-3.5 md:gap-5 shadow-soft-lg transition-colors duration-200 ease-soft group-hover:border-line-strong group-hover:bg-white/[0.05]">
                                                <div className="flex items-center gap-3.5 md:gap-5 flex-1 min-w-0">
                                                    <div
                                                        className="relative shrink-0"
                                                        onMouseEnter={(e) => handleProfileMouseEnter(e, req.fromUserId)}
                                                        onMouseLeave={() => setShowHoverCard(false)}
                                                    >
                                                        <div className="absolute -inset-1 bg-gradient-to-br from-brand to-brand-pink rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-250 ease-soft" />
                                                        <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[14px] md:rounded-[18px] overflow-hidden border border-surface-700 group-hover:border-brand/50 transition-colors duration-200 ease-soft shadow-xl p-[0.5px] bg-gradient-to-br from-brand/20 to-brand-pink/20">
                                                            <img
                                                                loading="lazy"
                                                                decoding="async"
                                                                src={req.fromUser?.imageUrl || "/default-avatar.png"}
                                                                className="w-full h-full object-cover rounded-[13px] md:rounded-[17px]"
                                                                alt={
                                                                    req.fromUser
                                                                        ? `${req.fromUser.firstname} ${req.fromUser.lastname}`
                                                                        : "CLIQ User"
                                                                }
                                                            />
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-lg z-20">
                                                            <UserPlus size={10} className="text-black font-black" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col min-w-0">
                                                        <Link
                                                            to={`/public-profile/${req.fromUserId}`}
                                                            className="inline-block font-black text-[16px] md:text-[20px] text-white hover:text-brand-light transition-colors duration-150 ease-soft rounded-md focus-ring truncate no-underline tracking-tighter leading-none italic uppercase"
                                                        >
                                                            {req.fromUser
                                                                ? `${req.fromUser.firstname} ${req.fromUser.lastname}`
                                                                : "CLIQ User"}
                                                        </Link>
                                                        <div className="flex items-center gap-3 mt-1.5 underline decoration-white/5 underline-offset-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand motion-safe:animate-pulse" />
                                                                <p className="text-[9px] md:text-[11px] text-ink-300 font-black uppercase tracking-widest">
                                                                    Pending
                                                                </p>
                                                            </div>
                                                            <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                                                            {req.fromUser?.expertise && (
                                                                <p className="text-ink-300 text-[9px] md:text-[11px] font-medium mt-0 truncate line-clamp-1 uppercase tracking-widest italic flex-1">
                                                                    {req.fromUser.expertise.aboutYou ||
                                                                        req.fromUser.expertise.description ||
                                                                        "Expertise details undisclosed"}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                                    <motion.button
                                                        whileHover={{ scale: 1.04 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        type="button"
                                                        aria-label={`Reject request from ${req.fromUser ? `${req.fromUser.firstname} ${req.fromUser.lastname}` : "CLIQ User"}`}
                                                        onClick={() =>
                                                            openConfirmation(req.fromUserId, "rejected", req.id)
                                                        }
                                                        className="w-9 h-9 md:w-11 md:h-11 rounded-[10px] md:rounded-[12px] bg-white/[0.04] border border-white/5 text-ink-300 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors duration-150 ease-soft flex items-center justify-center group/btn focus-ring"
                                                    >
                                                        <UserMinus
                                                            size={18}
                                                            className="group-hover/btn:rotate-[-10deg] transition-transform duration-150 ease-soft"
                                                        />
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        onClick={() =>
                                                            openConfirmation(req.fromUserId, "accepted", req.id)
                                                        }
                                                        className="px-4 md:px-7 py-2 md:py-3.5 rounded-[10px] md:rounded-[12px] bg-emerald-500 text-black font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-[background-color,box-shadow] duration-150 ease-soft shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 focus-ring"
                                                    >
                                                        <UserCheck size={16} />
                                                        <span className="font-black tracking-tighter uppercase italic text-[11px] md:text-[13px]">
                                                            Accept
                                                        </span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ProfileHoverCard
                        isVisible={showHoverCard}
                        anchorRect={hoverAnchorRect}
                        userId={hoverUserId}
                        onMouseEnter={() => setShowHoverCard(true)}
                        onMouseLeave={() => setShowHoverCard(false)}
                    />

                    <ConfirmDialog
                        isOpen={confirmation.isOpen}
                        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                        onConfirm={confirmReview}
                        title={confirmation.type === "accepted" ? "Accept Invitation?" : "Reject Invitation?"}
                        confirmText={confirmation.type === "accepted" ? "YES, ACCEPT" : "YES, REJECT"}
                        confirmColor={
                            confirmation.type === "accepted"
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black font-black italic shadow-lg shadow-emerald-500/20"
                                : "bg-rose-500 hover:bg-rose-600 text-white font-black italic shadow-lg shadow-rose-500/20"
                        }
                    />

                    {toast && <Toastbar message={toast} onClose={() => setToast(null)} duration={3000} />}
                </div>
            </div>
        </MotionConfig>
    );
}
