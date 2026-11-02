/** Smart-match card deck: the current card, the next one and a prefetched queue, plus loading and tracking. */
import { useState, useEffect, useRef } from "react";
import * as connectionsApi from "../api/connections";
import {
    readSmartConnectionsCache,
    writeSmartConnectionsCache,
    warmSmartConnectionsCache,
} from "../utils/smartConnectionCache";
import { reportSmartCardShown } from "../utils/connectionCardTracking";

const PREFETCH_QUEUE_TARGET = 6;

/**
 * @param {object} args
 * @param {{ id?: string } | null} args.authUser signed-in user
 * @param {boolean} args.authLoading true until the session check finishes
 * @param {{ current: string|null }} args.ownerIdRef signed-in user the loaders are working for
 * @param {(ownerId: string|null) => boolean} args.isStaleFor true when a response belongs to a previous account
 * @param {boolean} args.sending a card action is in flight (pauses prefetching)
 * @param {() => void} args.resetCard puts the card UI (menus, motion values) back to its resting state
 * @param {() => void} args.onAccountReady loads the other per-account data once the deck starts loading
 */
export const useConnectionDeck = ({
    authUser,
    authLoading,
    ownerIdRef,
    isStaleFor,
    sending,
    resetCard,
    onAccountReady,
}) => {
    const [user, setUser] = useState(null);
    const [nextUser, setNextUser] = useState(null);
    const [userQueue, setUserQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const lastPrefetchAtRef = useRef(0);
    const lastTrackedShownRef = useRef("");

    const applyBatchToDeck = (batch = []) => {
        if (batch.length > 0) {
            setUser(batch[0]);
            setNextUser(batch[1] || null);
            setUserQueue(batch.slice(2));
            return true;
        }

        setUser(null);
        setNextUser(null);
        setUserQueue([]);
        return false;
    };

    // --- Fetching Logic ---
    const fetchSmartBatch = async (excludeIds = [], { refresh = false } = {}) => {
        try {
            const params = new URLSearchParams();
            excludeIds.forEach((id) => params.append("excludeIds", id));
            if (refresh) params.append("refresh", "true");
            const data = await connectionsApi.getSmartUsers(`?${params.toString()}`);
            const batch = Array.isArray(data) ? data : [];
            if (authUser?.id && excludeIds.length === 0 && batch.length > 0) {
                writeSmartConnectionsCache(authUser.id, batch);
            }
            return batch;
        } catch (err) {
            console.error("Error fetching smart users:", err);
            return [];
        }
    };

    const initializeUsers = async ({ excludeIds = [], refresh = false } = {}) => {
        const canUseCachedBatch = authUser?.id && excludeIds.length === 0 && !refresh;
        if (canUseCachedBatch) {
            const cachedBatch = readSmartConnectionsCache(authUser.id);
            if (cachedBatch.length > 0) {
                setLoading(false);
                applyBatchToDeck(cachedBatch);
                warmSmartConnectionsCache({ userId: authUser.id });
                return;
            }
        }

        const ownerId = ownerIdRef.current;
        setLoading(true);
        applyBatchToDeck([]);
        const batch = await fetchSmartBatch(excludeIds, { refresh });
        if (isStaleFor(ownerId)) return; // the account changed while this batch loaded
        applyBatchToDeck(batch);
        setLoading(false);
    };

    // --- Event Logic ---
    const trackShownCard = async (activeUser) => {
        if (!activeUser?.id) return;
        const trackingKey = `${activeUser.id}:${activeUser.matchScore || ""}:${activeUser.selectionMode || ""}`;
        if (lastTrackedShownRef.current === trackingKey) return;
        lastTrackedShownRef.current = trackingKey;
        try {
            await reportSmartCardShown(activeUser);
        } catch (err) {
            console.error("Failed to track shown card:", err);
        }
    };

    const advanceToNextUser = async () => {
        resetCard();

        if (nextUser) {
            setUser(nextUser);
            const newQueue = [...userQueue];
            if (newQueue.length > 0) {
                const next = newQueue.shift();
                setNextUser(next);
                setUserQueue(newQueue);
            } else {
                setNextUser(null);
            }
            if (newQueue.length <= 2) fetchMoreUsers();
        } else {
            initializeUsers();
        }
    };

    const fetchMoreUsers = async () => {
        if (isFetchingMore) return;
        lastPrefetchAtRef.current = Date.now();
        setIsFetchingMore(true);
        const currentIds = [user?.id, nextUser?.id, ...userQueue.map((u) => u.id)].filter(Boolean);
        const ownerId = ownerIdRef.current;
        const newBatch = await fetchSmartBatch(currentIds);
        if (isStaleFor(ownerId)) {
            setIsFetchingMore(false);
            return;
        }
        if (newBatch.length > 0) {
            setUserQueue((prev) => {
                const combined = [...prev, ...newBatch];
                const seen = new Set();
                return combined.filter((u) => u.id && !seen.has(u.id) && seen.add(u.id));
            });
        }
        setIsFetchingMore(false);
    };

    // --- Effects ---
    useEffect(() => {
        ownerIdRef.current = authUser?.id ?? null;
        if (authLoading) return;
        initializeUsers();
        onAccountReady();
        // Load once per signed-in user; the fetch helpers are recreated every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, authUser?.id]);

    useEffect(() => {
        if (user?.id) trackShownCard(user);
        // Track each card once when it appears, not every time its object is recreated
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        if (loading || isFetchingMore || sending) return;
        const availableCards = (user ? 1 : 0) + (nextUser ? 1 : 0) + userQueue.length;
        const prefetchCooldownActive = Date.now() - lastPrefetchAtRef.current < 4000;
        if (availableCards > 0 && availableCards < PREFETCH_QUEUE_TARGET && !prefetchCooldownActive) {
            fetchMoreUsers();
        }
        // Re-check the queue when its size or loading state changes; fetchMoreUsers is recreated every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, isFetchingMore, sending, user, nextUser, userQueue.length]);

    const refreshMatches = () => {
        initializeUsers({ refresh: true });
    };

    return { user, nextUser, userQueue, loading, isFetchingMore, advanceToNextUser, refreshMatches };
};
