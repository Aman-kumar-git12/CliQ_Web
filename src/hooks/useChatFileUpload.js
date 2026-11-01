/** Chat page file attachments: the picked file, its image preview and caption, and uploading it as a message. */
import { useRef, useState } from "react";
import * as chatApi from "../api/chat";

export const useChatFileUpload = ({ sendDirectMessage, setToast }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileCaption, setFileCaption] = useState("");
    const fileInputRef = useRef(null);

    // File Upload Logic
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setFilePreview(url);
        } else {
            setFilePreview(null);
        }
        setFileCaption("");
    };

    const handleCancelFile = () => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        setFileCaption("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendFile = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);

            const { url, type, originalName } = await chatApi.uploadChatFile(formData, { silent: true });

            // Send with caption
            if (type === "image") sendDirectMessage(fileCaption, url, null, originalName);
            else sendDirectMessage(fileCaption, null, url, originalName);

            setToast(`✅ Sent!`);
            handleCancelFile();
        } catch (error) {
            console.error("Upload error:", error);
            setToast(`❌ ${error.response?.data?.message || "Upload failed."}`);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        isUploading,
        setIsUploading,
        selectedFile,
        filePreview,
        fileCaption,
        setFileCaption,
        fileInputRef,
        handleFileChange,
        handleCancelFile,
        handleSendFile,
    };
};

export default useChatFileUpload;
