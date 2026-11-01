/** Chat page emoji picker: open state, closing on an outside click, and appending the picked emoji to the draft. */
import { useEffect, useRef, useState } from "react";

export const useChatEmojiPicker = ({ setNewMessage }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Emoji Picker Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
    };

    return { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, onEmojiClick };
};

export default useChatEmojiPicker;
