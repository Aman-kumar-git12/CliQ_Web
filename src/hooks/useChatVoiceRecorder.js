/** Chat page voice messages: microphone recording with a running clock, then uploading and sending the clip. */
import { useEffect, useRef, useState } from "react";
import * as chatApi from "../api/chat";

export const useChatVoiceRecorder = ({ sendDirectMessage, setToast, setIsUploading }) => {
    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const isRecordingCancelledRef = useRef(false);

    // The recording clock must not keep running after leaving the chat
    useEffect(() => () => clearInterval(recordingTimerRef.current), []);

    // Voice Recording Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                if (isRecordingCancelledRef.current) {
                    setIsRecording(false);
                    return;
                }
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            isRecordingCancelledRef.current = false;
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Mic error:", error);
            setToast("Permission denied for microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            isRecordingCancelledRef.current = false;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current) {
            isRecordingCancelledRef.current = true;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setIsRecording(false);
        setAudioBlob(null);
        setRecordingTime(0);
        clearInterval(recordingTimerRef.current);
    };

    useEffect(() => {
        if (audioBlob) {
            sendVoiceMessage();
        }
        // Sends exactly once per recorded clip; sendVoiceMessage changes every render and must not retrigger it
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioBlob]);

    const sendVoiceMessage = async () => {
        if (!audioBlob) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_message.webm");

        try {
            const data = await chatApi.uploadChatFile(formData, { silent: true });
            if (data?.url) {
                sendDirectMessage("", null, data.url, "voice_message.webm");
            } else {
                console.error("Voice Upload Error:", data);
                setToast("Cloud upload failed");
            }
            setAudioBlob(null);
            setRecordingTime(0);
        } catch (error) {
            console.error("Upload error:", error);
            setToast(error.response?.data?.message || "Failed to upload voice message");
        } finally {
            setIsUploading(false);
        }
    };

    return { isRecording, recordingTime, audioBlob, startRecording, stopRecording, cancelRecording };
};

export default useChatVoiceRecorder;
