import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Confirmation from "../Confirmation";
import RequestsShimmering from "../shimmering/RequestsShimmering";

export default function ConnectionsRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReview, setLoadingReview] = useState(false);

    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        type: null, // "accepted" or "rejected"
        requestId: null,
        userId: null
    });

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

                setRequests(requestsWithUserData);
            } catch (err) {
                console.log(err);
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
            console.log("Reviewing request:", requestId, type, "for user:", userId);
            await axiosClient.post(
                `/request/review/${type}/${requestId}`,
                {},
                { withCredentials: true }
            );
            console.log("done")
            setLoadingReview(!loadingReview);

            setRequests((prev) => prev.filter((req) => req.fromUserId !== userId));
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingReview(false);
            setConfirmation({ isOpen: false, type: null, requestId: null, userId: null });
        }
    };

    if (loading) {
        return <RequestsShimmering />;
    }

    return (
        <div className="p-6 w-full">
            <h1 className="text-2xl font-semibold text-black dark:text-white mb-4">
                Connection Requests
            </h1>

            {requests.length === 0 && (
                <p className="text-neutral-500 dark:text-neutral-400">
                    No pending requests
                </p>
            )}

            <div className="flex flex-col gap-4 mt-4">
                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow flex justify-between items-center"
                    >
                        {/* LEFT: Profile Pic + Name */}
                        <Link
                            to={`/public-profile/${req.fromUserId}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-inherit no-underline"
                        >
                            <img
                                src={
                                    req.user?.imageUrl ||
                                    "/default-avatar.png"
                                }
                                className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                                alt="user"
                            />

                            <div>
                                <h2 className="font-medium text-black dark:text-white">
                                    {req.user
                                        ? `${req.user.firstname} ${req.user.lastname}`
                                        : "Unknown User"}
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    sent you a connection request
                                </p>
                            </div>
                        </Link>

                        {/* RIGHT: Accept / Reject */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => openConfirmation(req.fromUserId, "accepted", req.id)}
                                className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                            >
                                Accept
                            </button>

                            <button
                                onClick={() => openConfirmation(req.fromUserId, "rejected", req.id)}
                                className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Confirmation
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={confirmReview}
                title={confirmation.type === "accepted" ? "Accept Connection Request?" : "Reject Connection Request?"}
                confirmText={confirmation.type === "accepted" ? "Yes, Accept" : "Yes, Reject"}
                confirmColor={confirmation.type === "accepted" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
            />
        </div>
    );
}
