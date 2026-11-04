import { useState, useEffect, useRef } from "react";
import * as usersApi from "../api/users";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ExpertiseAIModal from "../components/expertise/ExpertiseAIModal";
import ExpertiseAIQuestionsStep from "../components/expertise/ExpertiseAIQuestionsStep";
import ExpertiseAIResultStep from "../components/expertise/ExpertiseAIResultStep";
import ExpertiseSavingOverlay from "../components/expertise/ExpertiseSavingOverlay";
import ExpertiseSnackbar from "../components/expertise/ExpertiseSnackbar";
import ExpertiseStudioForm from "../components/expertise/ExpertiseStudioForm";
import ExpertiseStudioHeader from "../components/expertise/ExpertiseStudioHeader";
import ExpertiseTemplatePicker from "../components/expertise/ExpertiseTemplatePicker";
import ExpertiseStudioShimmering from "../components/shimmering/ExpertiseStudioShimmering";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useExpertiseStudioFields } from "../hooks/useExpertiseStudioFields";

const ExpertiseStudioPage = () => {
    const navigate = useNavigate();
    const snackbarTimerRef = useRef(null);
    const navigateTimerRef = useRef(null);

    // The snackbar hide and the delayed "go to profile" must not fire after leaving the page
    useEffect(
        () => () => {
            clearTimeout(snackbarTimerRef.current);
            clearTimeout(navigateTimerRef.current);
        },
        [],
    );
    const [selectedFormat, setSelectedFormat] = useState(1);

    // Form State
    const form = useExpertiseStudioFields();
    const {
        name,
        setName,
        description,
        experience,
        skills,
        projects,
        achievements,
        interests,
        aboutYou,
        email,
        setEmail,
        address,
        applyExpertiseFields,
    } = form;

    // UI State
    // The saved expertise fills the form; until it arrives the page shows its skeleton (saving an
    // empty form meanwhile would overwrite it)
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // AI Modal State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    useEscapeKey(isAIModalOpen, () => setIsAIModalOpen(false));
    const [aiStage, setAiStage] = useState(1);
    const [seeMoreInterests, setSeeMoreInterests] = useState(false);
    const [seeMoreSkills, setSeeMoreSkills] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiAnswers, setAiAnswers] = useState({
        role: "",
        skills: "",
        interests: "",
        about: "",
        highlights: "",
        location: "",
    });
    const [aiGeneratedData, setAiGeneratedData] = useState(null);
    const [aiGenerationSource, setAiGenerationSource] = useState("llm");
    const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const currentExpertiseDraft = {
        name,
        description,
        experience,
        skills: skillList,
        projects,
        achievements,
        interests,
        aboutYou,
        details: { email, address },
    };

    const handleGenerateAI = async () => {
        if (!aiAnswers.about || aiAnswers.about.length < 10) {
            return showSnackbar("Tell us a bit more about yourself (min. 10 chars)", "error");
        }

        setIsGeneratingAI(true);
        try {
            const data = await usersApi.generateAiExpertise(aiAnswers, { silent: true });
            setAiGeneratedData(data.expertise);
            setAiGenerationSource(data.generation_source || "llm");
            setAiStage(2);
        } catch (err) {
            console.error(err);
            showSnackbar("Failed to generate expertise", "error");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleAIManualEdit = () => {
        if (!aiGeneratedData) return;

        applyExpertiseFields(aiGeneratedData);

        setIsAIModalOpen(false);
        showSnackbar("Profile updated! You can now refine it manually.", "success");
    };

    const handleOpenAIModal = () => {
        setAiGeneratedData(null);
        setAiGenerationSource("llm");
        setAiStage(1);
        setAiAnswers({ role: "", skills: "", interests: "", about: "", highlights: "", location: "" });
        setIsAIModalOpen(true);
    };

    const handleAIUpload = async () => {
        if (!aiGeneratedData) return;
        setIsSaving(true);
        setIsAIModalOpen(false);

        try {
            await usersApi.updateExpertise({ ...aiGeneratedData, format: selectedFormat }, { silent: true });
            showSnackbar("Expertise live on your profile!", "success");
            navigateTimerRef.current = setTimeout(() => navigate("/profile"), 1000);
        } catch (err) {
            console.error(err);
            showSnackbar("Failed to upload expertise", "error");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController(); // dropped if the page is left before it loads
        const fetchExpertise = async () => {
            try {
                const { user } = await usersApi.getMyProfile({ signal: controller.signal });
                if (user && user.expertise) {
                    const exp = user.expertise;
                    setName(`${user.firstname} ${user.lastname}`);
                    applyExpertiseFields(exp);
                    if ([1, 2, 3, 4].includes(exp.format)) setSelectedFormat(exp.format);
                } else if (user) {
                    setName(`${user.firstname} ${user.lastname}`);
                    setEmail(user.email);
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error("Failed to fetch expertise:", err);
            }
            setLoadingProfile(false);
        };
        fetchExpertise();
        return () => controller.abort();
        // Load once on mount; setName/setEmail/applyExpertiseFields only call stable useState setters
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useBodyScrollLock(isAIModalOpen || isSaving || showConfirm);

    const showSnackbar = (message, type = "success") => {
        setSnackbar({ open: true, message, type });
        clearTimeout(snackbarTimerRef.current);
        snackbarTimerRef.current = setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 3000);
    };

    const handleSaveClick = () => {
        if (!selectedFormat) return showSnackbar("Please choose a layout template", "error");
        setShowConfirm(true);
    };

    const executeUpload = async () => {
        setShowConfirm(false);
        setIsSaving(true);

        const payload = {
            name,
            description,
            experience,
            skills: skillList,
            projects,
            achievements,
            interests,
            aboutYou,
            details: { email, address },
            format: selectedFormat,
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            await usersApi.updateExpertise(payload, { silent: true });
            setIsSaving(false);
            showSnackbar("Expertise successfully updated!", "success");
            navigateTimerRef.current = setTimeout(() => navigate("/profile"), 1000);
        } catch (err) {
            console.error(err);
            setIsSaving(false);
            showSnackbar("Failed to update expertise", "error");
        }
    };

    if (loadingProfile) return <ExpertiseStudioShimmering />;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand/20 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] h-[420px] w-[420px] rounded-full bg-slate-200/60 blur-[120px] pointer-events-none" />
            <div className="absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-12%] right-[-6%] h-[420px] w-[420px] rounded-full bg-brand-pink/5 blur-[140px] pointer-events-none" />

            <ExpertiseStudioHeader
                onBack={() => navigate("/profile")}
                onOpenAIModal={handleOpenAIModal}
                onSave={handleSaveClick}
            />

            {/* AI EXPERTISE BUILDER MODAL */}
            {isAIModalOpen && (
                <ExpertiseAIModal aiStage={aiStage} onClose={() => setIsAIModalOpen(false)}>
                    {aiStage === 1 ? (
                        <ExpertiseAIQuestionsStep
                            aiAnswers={aiAnswers}
                            setAiAnswers={setAiAnswers}
                            seeMoreInterests={seeMoreInterests}
                            setSeeMoreInterests={setSeeMoreInterests}
                            seeMoreSkills={seeMoreSkills}
                            setSeeMoreSkills={setSeeMoreSkills}
                            isGeneratingAI={isGeneratingAI}
                            onGenerate={handleGenerateAI}
                        />
                    ) : (
                        <ExpertiseAIResultStep
                            aiGeneratedData={aiGeneratedData}
                            aiGenerationSource={aiGenerationSource}
                            onUpload={handleAIUpload}
                            onGenerateNew={() => {
                                setAiGeneratedData(null);
                                setAiStage(1);
                            }}
                            onManualEdit={handleAIManualEdit}
                        />
                    )}
                </ExpertiseAIModal>
            )}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
                    {/* LEFT COLUMN - THE STUDIO FORM */}
                    <div className="space-y-8 xl:col-span-7">
                        <ExpertiseStudioForm
                            form={form}
                            selectedFormat={selectedFormat}
                            skillList={skillList}
                            onSave={handleSaveClick}
                        />
                    </div>

                    {/* RIGHT COLUMN - TEMPLATE PICKER */}
                    <div className="space-y-6 xl:col-span-5 xl:sticky xl:top-24">
                        {/* BLUEPRINT GALLERY */}
                        <ExpertiseTemplatePicker
                            selectedFormat={selectedFormat}
                            onSelectFormat={setSelectedFormat}
                            expertiseDraft={currentExpertiseDraft}
                        />
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={executeUpload}
                title="Finalize Portfolio?"
                confirmText="Push Changes"
                confirmColor="bg-brand hover:bg-brand-light"
            />

            {/* SAVING OVERLAY */}
            {isSaving && <ExpertiseSavingOverlay />}

            {/* SNACKBAR */}
            {snackbar.open && (
                <ExpertiseSnackbar snackbar={snackbar} onDismiss={() => setSnackbar({ ...snackbar, open: false })} />
            )}
        </div>
    );
};

export default ExpertiseStudioPage;
