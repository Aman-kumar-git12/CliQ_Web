import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Confirmation from "../Confirmation";
import RequestsShimmering from "../shimmering/RequestsShimmering";
import Toastbar from "../Chat/Toastbar";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserMinus, UserCheck, Inbox, Bell } from "lucide-react";
import ProfileHoverCard from "../Post/ProfileHoverCard";

export default function ConnectionsRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReview, setLoadingReview] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null, // "accepted" or "rejected"
        requestId: null,
        userId: null
    });

    // For Profile Hover Card
    const containerRef = useRef(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [hoverUserId, setHoverUserId] = useState(null);

    useEffect(() => {
        const fetchAllRequests = async () => {
            try {
                // 1️⃣ Fetch all connection requests
                const res = await axiosClient.get("/user/requests", {
                    withCredentials: true,
                });

                const rawRequests = res.data.connectionRequests;
                console.log(rawRequests);

                // 2️⃣ For each request → fetch user data
                const requestsWithUserData = await Promise.all(
                    rawRequests.map(async (req) => {
                        try {
                            const userRes = await axiosClient.get(
                                `/user/${req.fromUserId}`,
                                { withCredentials: true }
                            );
                            console.log(userRes.data);

                            return {
                                ...req,
                                user: userRes.data.user, // name, username, pic
                            };
                        } catch (err) {
                            console.log("Error fetching user:", err);
                            return { ...req, user: null };
                        }
                    })
                );

                // 3️⃣ Sort requests to show the latest first
                const sortedRequests = requestsWithUserData.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setRequests(sortedRequests);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRequests();
    }, [loadingReview]);

    useEffect(() => {
        if (containerRef.current) {
            // Optional: Do something with the ref if needed, e.g., for scroll effects
        }
    }, []);

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
            console.log("Reviewing request:", requestId, type, "for user:", userId);
            await axiosClient.post(
                `/request/review/${type}/${requestId}`,
                {},
                { withCredentials: true }
            );
            console.log("done")
            setLoadingReview(!loadingReview);

            setRequests((prev) => prev.filter((req) => req.fromUserId !== userId));

            // Show feedback toast
            setToast(type === "accepted" ? "Connection Request Accepted" : "Connection Request Rejected");

        } catch (err) {
            console.log(err);
            setToast("Something went wrong. Please try again.");
        } finally {
            setConfirmation({ isOpen: false, type: null, requestId: null, userId: null });
        }
    };

    const handleProfileMouseEnter = (e, userId) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverAnchorRect(rect);
        setHoverUserId(userId);
        setShowHoverCard(true);
    };

    const handleProfileMouseLeave = () => {
        setShowHoverCard(false);
        setHoverAnchorRect(null);
        setHoverUserId(null);
    };

    if (loading) {
        return <RequestsShimmering />;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            x: 50,
            filter: "blur(8px)",
            transition: { duration: 0.3 }
        }
    };

    return (
        <div ref={containerRef} className="p-6 md:p-10 w-full max-w-4xl mx-auto min-h-screen relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between mb-12"
            >
                <div className="relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute -top-4 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-transparent"
                    />
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        Requests <span className="text-neutral-500 font-light not-italic">({requests.length})</span>
                    </h1>
                    <p className="text-neutral-400 font-medium mt-2 flex items-center gap-2">
                        <Bell size={14} className="text-blue-500" />
                        Manage your network invitations
                    </p>
                </div>
            </motion.div>

            <AnimatePresence mode="popLayout" initial={false}>
                {requests.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-32 flex flex-col items-center justify-center text-center py-20 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl"
                    >
                        <div className="relative mb-6">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
                            />
                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center shadow-2xl">
                                <Inbox size={48} className="text-neutral-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Stay Connected!</h3>
                        <p className="text-neutral-500 max-w-xs text-lg">
                            Your network is quiet for now.
                        </p>
                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="mt-8 text-blue-500/50 text-sm font-bold tracking-[0.2em] uppercase"
                        >
                            End of queue
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-6"
                    >
                        {requests.map((req) => (
                            <motion.div
                                layout
                                key={req.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="group relative"
                            >
                                {/* Glow Background on Hover */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-[28px] blur opacity-0 group-hover:opacity-15 transition duration-500"></div>

                                <div className="relative p-6 rounded-[24px] border border-white/5 bg-neutral-900/[0.4] backdrop-blur-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-300">
                                    {/* Accent Line */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                    {/* LEFT: Profile Info */}
                                    <div className="flex items-center gap-6 w-full">
                                        <div
                                            className="relative p-1 rounded-full bg-gradient-to-br from-white/10 to-transparent"
                                            onMouseEnter={(e) => handleProfileMouseEnter(e, req.fromUserId)}
                                            onMouseLeave={handleProfileMouseLeave}
                                        >
                                            <img
                                                src={req.user?.imageUrl || "/default-avatar.png"}
                                                className="w-16 h-16 rounded-full object-cover border border-white/20 group-hover:border-white/50 transition-all duration-500"
                                                alt="requester"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-neutral-900 flex items-center justify-center shadow-lg">
                                                <UserPlus size={12} className="text-black font-bold" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <Link
                                                to={`/public-profile/${req.fromUserId}`}
                                                onMouseEnter={(e) => handleProfileMouseEnter(e, req.fromUserId)}
                                                onMouseLeave={handleProfileMouseLeave}
                                                className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors no-underline tracking-tight"
                                            >
                                                {req.user
                                                    ? `${req.user.firstname} ${req.user.lastname}`
                                                    : "Unknown User"}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                <p className="text-sm text-neutral-400 font-medium uppercase tracking-widest">
                                                    Invitation Received
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: High-Contrast Actions */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => openConfirmation(req.fromUserId, "rejected", req.id)}
                                            className="flex-1 sm:flex-none h-14 px-6 rounded-2xl bg-white/[0.03] border border-white/5 text-neutral-400 hover:text-red-500 hover:border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                            title="Reject"
                                        >
                                            <UserMinus size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                            <span className="sm:hidden font-bold">REJECT</span>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.3)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => openConfirmation(req.fromUserId, "accepted", req.id)}
                                            className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-green-500 text-black font-black flex items-center justify-center gap-2 hover:bg-green-400 transition-all duration-300"
                                            title="Accept"
                                        >
                                            <UserCheck size={20} />
                                            <span className="font-extrabold tracking-tighter uppercase">Accept</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Hover Card */}
            <ProfileHoverCard
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                userId={hoverUserId}
                onMouseEnter={() => setShowHoverCard(true)}
                onMouseLeave={handleProfileMouseLeave}
            />

            <Confirmation
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={confirmReview}
                title={confirmation.type === "accepted" ? "Accept Invitation?" : "Reject Invitation?"}
                confirmText={confirmation.type === "accepted" ? "YES, ACCEPT" : "YES, REJECT"}
                confirmColor={confirmation.type === "accepted" ? "bg-green-500 hover:bg-green-400 text-black font-black" : "bg-red-500 hover:bg-red-600 text-white font-black"}
            />

            {/* Feedback Toast */}
            {toast && (
                <Toastbar
                    message={toast}
                    onClose={() => setToast(null)}
                    duration={3000}
                />
            )}
        </div>
    );
}
