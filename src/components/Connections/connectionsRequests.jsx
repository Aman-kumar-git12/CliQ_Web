import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Confirmation from "../Confirmation";
import RequestsShimmering from "../shimmering/RequestsShimmering";
import Toastbar from "../Chat/Toastbar";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserMinus, UserCheck, Inbox, Bell, Sparkles, Zap } from "lucide-react";
import ProfileHoverCard from "../Post/ProfileHoverCard";

export default function ConnectionsRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReview, setLoadingReview] = useState(false);
    const [toast, setToast] = useState(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null,
        requestId: null,
        userId: null
    });

    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [hoverUserId, setHoverUserId] = useState(null);

    useEffect(() => {
        const fetchAllRequests = async () => {
            try {
                const res = await axiosClient.get("/user/requests", {
                    withCredentials: true,
                });

                // Using the optimized backend data that already includes 'fromUser'
                const sortedRequests = (res.data.connectionRequests || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setRequests(sortedRequests);
            } catch (err) {
                console.error("Error fetching requests:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRequests();
    }, [loadingReview]);

    const openConfirmation = (userId, status, requestId) => {
        setConfirmation({
            isOpen: true,
            type: status,
            userId: userId,
            requestId: requestId
        });
    };

    const confirmReview = async () => {
        if (!confirmation.userId || !confirmation.type || !confirmation.requestId) return;
        const { userId, type, requestId } = confirmation;

        try {
            await axiosClient.post(
                `/request/review/${type}/${requestId}`,
                {},
                { withCredentials: true }
            );
            setLoadingReview(!loadingReview);
            setRequests((prev) => prev.filter((req) => req.fromUserId !== userId));
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
        <div className="w-full min-h-screen relative overflow-x-hidden pt-24 md:pt-12 bg-transparent">
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ec4899]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="px-4 md:px-0 max-w-full md:max-w-2xl mx-auto w-full pb-32">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
                >
                <div className="w-full max-w-full md:max-w-2xl mx-auto flex flex-col items-start justify-start relative z-10">
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="fill-[#8b5cf6]/20 text-[#8b5cf6]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Discovery Module</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-end justify-between w-full mb-6">
                        <div className="flex flex-col">
                            <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                                Connection
                            </h1>
                            <span className="text-[22px] md:text-[26px] text-[#8b85b1] font-light uppercase italic leading-none -mt-1 block">
                                Requests <span className="text-white/40 font-light not-italic font-sans">/ {requests.length}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start md:items-center gap-4">
                        <h2 className="text-[10px] md:text-[11px] font-black text-[#9a97b8] uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-start md:items-center gap-2 leading-relaxed">
                             <Bell size={12} className="text-[#a78bfa]/80 mt-0.5 md:mt-0 shrink-0" />
                             <span>People who want to connect with you</span>
                        </h2>
                    </div>
                </div>

                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Security Status</span>
                        <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-black text-white/70 uppercase tracking-widest">End-to-End Secure</span>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {requests.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full flex flex-col items-center justify-center text-center py-20 md:py-24 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                            <div className="relative mb-6">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                    className="absolute inset-0 bg-[#8b5cf6] rounded-full blur-3xl"
                                />
                                <div className="relative w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 backdrop-blur-xl">
                                    <Inbox size={36} className="text-white/20" />
                                </div>
                            </div>
                            <h3 className="text-[22px] font-black text-white tracking-tighter uppercase italic mb-1">No pending requests</h3>
                            <p className="text-white/30 max-w-sm text-xs font-medium uppercase tracking-widest">Your connection queue is currently clear.</p>
                            
                            <Link to="/find/findpeople" className="mt-8 px-6 py-3.5 bg-white text-black text-[11px] font-black uppercase italic rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                                Discover People
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="flex flex-col gap-4"
                        >
                            {requests.map((req) => (
                                <motion.div
                                    layout
                                    key={req.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-px bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-[22px] opacity-0 group-hover:opacity-10 transition duration-700 blur-lg" />
                                    <div className="relative p-3.5 md:p-5 rounded-[20px] md:rounded-[22px] border border-white/5 bg-white/[0.03] backdrop-blur-3xl flex flex-row justify-between items-center gap-3.5 md:gap-5 shadow-2xl transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.05]">

                                        <div className="flex items-center gap-3.5 md:gap-5 flex-1 min-w-0">
                                            <div 
                                                className="relative shrink-0"
                                                onMouseEnter={(e) => handleProfileMouseEnter(e, req.fromUserId)}
                                                onMouseLeave={() => setShowHoverCard(false)}
                                            >
                                                <div className="absolute -inset-1 bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500" />
                                                <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[14px] md:rounded-[18px] overflow-hidden border border-[#110f18] group-hover:border-[#8b5cf6]/50 transition-all duration-500 shadow-2xl p-[0.5px] bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20">
                                                    <img
                                                        src={req.fromUser?.imageUrl || "/default-avatar.png"}
                                                        className="w-full h-full object-cover rounded-[13px] md:rounded-[17px]"
                                                        alt="requester"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-lg z-20">
                                                    <UserPlus size={10} className="text-black font-black" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                                <Link
                                                    to={`/public-profile/${req.fromUserId}`}
                                                    className="inline-block font-black text-[16px] md:text-[20px] text-white hover:text-[#a78bfa] transition-colors truncate no-underline tracking-tighter leading-none italic uppercase"
                                                >
                                                    {req.fromUser ? `${req.fromUser.firstname} ${req.fromUser.lastname}` : "CLIQ User"}
                                                </Link>
                                                <div className="flex items-center gap-3 mt-1.5 underline decoration-white/5 underline-offset-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
                                                        <p className="text-[9px] md:text-[11px] text-white/40 font-black uppercase tracking-widest">Pending</p>
                                                    </div>
                                                    <span className="w-1 h-1 rounded-full bg-[#1c1a24]"></span>
                                                    {req.fromUser?.expertise && (
                                                        <p className="text-white/25 text-[9px] md:text-[11px] font-medium mt-0 truncate line-clamp-1 uppercase tracking-widest italic flex-1">
                                                            {req.fromUser.expertise.aboutYou || req.fromUser.expertise.description || "Expertise details undisclosed"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                            <motion.button
                                                whileHover={{ scale: 1.05, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openConfirmation(req.fromUserId, "rejected", req.id)}
                                                className="w-9 h-9 md:w-11 md:h-11 rounded-[10px] md:rounded-[12px] bg-white/[0.04] border border-white/5 text-white/30 hover:text-rose-500 hover:border-rose-500/30 transition-all duration-300 flex items-center justify-center group/btn"
                                            >
                                                <UserMinus size={18} className="group-hover/btn:rotate-[-10deg] transition-transform" />
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openConfirmation(req.fromUserId, "accepted", req.id)}
                                                className="px-4 md:px-7 py-2 md:py-3.5 rounded-[10px] md:rounded-[12px] bg-emerald-500 text-black font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all duration-300 shadow-xl"
                                            >
                                                <UserCheck size={16} />
                                                <span className="font-black tracking-tighter uppercase italic text-[11px] md:text-[13px]">Accept</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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

                <Confirmation
                    isOpen={confirmation.isOpen}
                    onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                    onConfirm={confirmReview}
                    title={confirmation.type === "accepted" ? "Accept Invitation?" : "Reject Invitation?"}
                    confirmText={confirmation.type === "accepted" ? "YES, ACCEPT" : "YES, REJECT"}
                    confirmColor={confirmation.type === "accepted" ? "bg-emerald-500 hover:bg-emerald-400 text-black font-black italic shadow-[0_10px_20px_rgba(16,185,129,0.2)]" : "bg-rose-500 hover:bg-rose-600 text-white font-black italic shadow-[0_10px_20px_rgba(244,63,94,0.2)]"}
                />

                {toast && (
                    <Toastbar message={toast} onClose={() => setToast(null)} duration={3000} />
                )}
            </div>
        </div>
    );
}
