import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

vi.mock("../api/chat", () => ({ getChatHistory: vi.fn() }));
vi.mock("../api/users", () => ({ getUser: vi.fn() }));
vi.mock("../api/connections", () => ({ getConnectionStatus: vi.fn() }));

import * as chatApi from "../api/chat";
import * as usersApi from "../api/users";
import * as connectionsApi from "../api/connections";
import { useChatConversation } from "../hooks/useChatConversation";
import { appendIncomingMessage, useChatSocketEvents } from "../hooks/useChatSocketEvents";

const ME = { id: "me", firstname: "Me", imageUrl: "me.png" };
const ADA_ID = "a".repeat(24);
const BOB_ID = "b".repeat(24);

// A stand-in for the shared Socket.IO client: records what the page sends and lets a test play server events
const createFakeSocket = ({ connected = true } = {}) => {
    const listeners = new Map();
    return {
        connected,
        sent: [],
        on(event, fn) {
            listeners.set(event, [...(listeners.get(event) || []), fn]);
        },
        off(event, fn) {
            listeners.set(
                event,
                (listeners.get(event) || []).filter((l) => l !== fn),
            );
        },
        emit(event, payload, ack) {
            this.sent.push(event);
            if (event === "checkStatus") ack?.({ status: "online" });
        },
        serverSends(event, data) {
            (listeners.get(event) || []).forEach((fn) => fn(data));
        },
        listenerCount(event) {
            return (listeners.get(event) || []).length;
        },
    };
};

const deferred = () => {
    let resolve;
    const promise = new Promise((r) => (resolve = r));
    return { promise, resolve };
};

const useConversation = (targetuserId) => {
    const [messages, setMessages] = useState([]);
    const noop = () => {};
    const conversation = useChatConversation({
        targetuserId,
        user: ME,
        setMessages,
        setIsSelectMode: noop,
        setSelectedMessages: noop,
        setReplyTo: noop,
        setNewMessage: noop,
    });
    return { ...conversation, messages };
};

describe("useChatConversation", () => {
    beforeEach(() => {
        connectionsApi.getConnectionStatus.mockResolvedValue({ status: "accepted" });
    });

    it("loads the history once, alongside the other user, and fills in their name when it arrives", async () => {
        const user = deferred();
        usersApi.getUser.mockReturnValue(user.promise);
        chatApi.getChatHistory.mockResolvedValue([
            { id: "m1", senderId: ADA_ID, text: "hi", originalName: "cv.pdf", file: "https://f/x" },
            { id: "m2", senderId: "me", text: "hey" },
        ]);

        const { result } = renderHook(() => useConversation(ADA_ID));
        // The history request doesn't wait for the user request
        await waitFor(() => expect(result.current.messages).toHaveLength(2));
        expect(result.current.loading).toBe(true); // still waiting for the header's user
        expect(result.current.messages[0]).toMatchObject({ firstname: "User", originalName: "cv.pdf" });

        await act(async () => user.resolve({ user: { id: ADA_ID, firstname: "Ada", imageUrl: "ada.png" } }));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.messages[0]).toMatchObject({ firstname: "Ada", imageUrl: "ada.png" });
        expect(result.current.messages[1]).toMatchObject({ firstname: "Me", isMe: true });
        expect(chatApi.getChatHistory).toHaveBeenCalledTimes(1);
    });

    it("clears the previous chat when switching, so its messages and header never show under the new user", async () => {
        usersApi.getUser.mockImplementation((id) =>
            Promise.resolve({ user: { id, firstname: id === ADA_ID ? "Ada" : "Bob" } }),
        );
        chatApi.getChatHistory.mockResolvedValueOnce([{ id: "m1", senderId: ADA_ID, text: "from ada" }]);
        const bobHistory = deferred();
        chatApi.getChatHistory.mockReturnValueOnce(bobHistory.promise);

        const { result, rerender } = renderHook(({ id }) => useConversation(id), { initialProps: { id: ADA_ID } });
        await waitFor(() => expect(result.current.messages).toHaveLength(1));

        rerender({ id: BOB_ID });
        expect(result.current.messages).toEqual([]);
        expect(result.current.loading).toBe(true);

        await act(async () => bobHistory.resolve([{ id: "m9", senderId: BOB_ID, text: "from bob" }]));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.targetUser.firstname).toBe("Bob");
        expect(result.current.messages.map((m) => m.text)).toEqual(["from bob"]);
    });
});

describe("useChatSocketEvents", () => {
    const setup = (socket, props = {}) => {
        const onReconnect = vi.fn();
        const hook = renderHook(
            ({ targetUser }) => {
                const [messages, setMessages] = useState([]);
                useChatSocketEvents({
                    socket,
                    user: ME,
                    targetuserId: ADA_ID,
                    targetUser,
                    setMessages,
                    scrollToBottom: () => {},
                    onReconnect,
                });
                return messages;
            },
            { initialProps: { targetUser: null, ...props } },
        );
        return { ...hook, onReconnect };
    };

    it("does not leave and re-join the room when the other user's profile arrives", () => {
        const socket = createFakeSocket();
        const { rerender } = setup(socket);
        rerender({ targetUser: { id: ADA_ID, imageUrl: "ada.png" } });
        expect(socket.sent.filter((e) => e === "joinChat")).toHaveLength(1);
        expect(socket.sent).not.toContain("leaveChat");
    });

    it("shows a message delivered twice only once, keeping its file name", () => {
        const socket = createFakeSocket();
        const { result } = setup(socket);
        const message = { id: "m1", senderId: ADA_ID, text: "cv", file: "https://f/x", originalName: "cv.pdf" };
        act(() => {
            socket.serverSends("receiveMessage", message);
            socket.serverSends("receiveMessage", message);
        });
        expect(result.current).toHaveLength(1);
        expect(result.current[0].originalName).toBe("cv.pdf");
    });

    it("re-joins the chat room and reloads the history after a reconnect, not on the first connect", () => {
        const socket = createFakeSocket({ connected: false });
        const { onReconnect } = setup(socket);
        act(() => socket.serverSends("connect")); // first connection: the buffered joinChat is sent anyway
        expect(onReconnect).not.toHaveBeenCalled();

        act(() => socket.serverSends("connect")); // the connection dropped and came back
        expect(onReconnect).toHaveBeenCalledTimes(1);
        expect(socket.sent.filter((e) => e === "joinChat")).toHaveLength(2);
    });

    it("removes its listeners and leaves the room on unmount", () => {
        const socket = createFakeSocket();
        const { unmount } = setup(socket);
        unmount();
        expect(socket.listenerCount("receiveMessage")).toBe(0);
        expect(socket.listenerCount("connect")).toBe(0);
        expect(socket.sent).toContain("leaveChat");
    });

    it("appendIncomingMessage ignores an id that is already listed", () => {
        const list = [{ id: "m1" }];
        expect(appendIncomingMessage(list, { id: "m1" })).toBe(list);
        expect(appendIncomingMessage(list, { id: "m2" })).toHaveLength(2);
    });
});
