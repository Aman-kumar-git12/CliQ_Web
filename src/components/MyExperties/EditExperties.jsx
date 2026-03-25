import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Check, LayoutTemplate, Sparkles, Wand2, X, ChevronRight, RotateCcw, Save, User, Briefcase, Award, Zap, Code, Mail, MapPin, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confirmation from "../Confirmation";
import MyExperties from "./MyExperties";

const ExpertisePage = () => {
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [achievements, setAchievements] = useState("");
  const [interests, setInterests] = useState("");
  const [aboutYou, setAboutYou] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // UI State
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
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
    location: ""
  });
  const [aiGeneratedData, setAiGeneratedData] = useState(null);
  const [aiGenerationSource, setAiGenerationSource] = useState("llm");
  const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

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
      const res = await axiosClient.post("/generate-ai-expertise", { answers: aiAnswers });
      setAiGeneratedData(res.data.expertise);
      setAiGenerationSource(res.data.generation_source || "llm");
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
    
    setDescription(aiGeneratedData.description || "");
    setExperience(aiGeneratedData.experience || "");
    setSkills(Array.isArray(aiGeneratedData.skills) ? aiGeneratedData.skills.join(", ") : "");
    setProjects(aiGeneratedData.projects || "");
    setAchievements(aiGeneratedData.achievements || "");
    setInterests(aiGeneratedData.interests || "");
    setAboutYou(aiGeneratedData.aboutYou || "");
    if (aiGeneratedData.details) {
      setEmail(aiGeneratedData.details.email || "");
      setAddress(aiGeneratedData.details.address || "");
    }

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
      await axiosClient.put("/profile/expertise", { ...aiGeneratedData, format: selectedFormat });
      showSnackbar("Expertise live on your profile!", "success");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to upload expertise", "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const res = await axiosClient.get("/profile", { withCredentials: true });
        const user = res.data.user;
        if (user && user.expertise) {
          const exp = user.expertise;
          setName(`${user.firstname} ${user.lastname}`);
          setDescription(exp.description || "");
          setExperience(exp.experience || "");
          setSkills(Array.isArray(exp.skills) ? exp.skills.join(", ") : "");
          setProjects(exp.projects || "");
          setAchievements(exp.achievements || "");
          setInterests(exp.interests || "");
          setAboutYou(exp.aboutYou || "");
          if (exp.details) {
            setEmail(exp.details.email || "");
            setAddress(exp.details.address || "");
          }
          if ([1, 2, 3, 4].includes(exp.format)) setSelectedFormat(exp.format);
        } else if (user) {
          setName(`${user.firstname} ${user.lastname}`);
          setEmail(user.email);
        }
      } catch (err) {
        console.error("Failed to fetch expertise:", err);
      }
    };
    fetchExpertise();
  }, []);

  useEffect(() => {
    const isModalOpen = isAIModalOpen || isSaving || showConfirm;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAIModalOpen, isSaving, showConfirm]);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 3000);
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
      await new Promise(resolve => setTimeout(resolve, 800));
      await axiosClient.put("/profile/expertise", payload);
      setIsSaving(false);
      showSnackbar("Expertise successfully updated!", "success");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      showSnackbar("Failed to update expertise", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-200/60 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[420px] w-[420px] rounded-full bg-slate-200/60 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-indigo-100/70 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-6%] h-[420px] w-[420px] rounded-full bg-sky-100/60 blur-[140px] pointer-events-none" />

      <header className="sticky top-0 z-[100] w-full border-b border-black/5 bg-white/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/profile")}
              className="group rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900"
            >
              <RotateCcw size={18} className="transition-transform group-hover:-rotate-45" />
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Profile Builder</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Expertise Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAIModal}
              className="group relative flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Sparkles size={16} className="text-indigo-500 transition-transform group-hover:rotate-12" />
              <span className="hidden sm:inline">Magic Builder</span>
            </button>
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold tracking-tight text-white shadow-lg transition-all active:scale-95 hover:bg-slate-800"
            >
              <Save size={16} />
              <span>Save Expertise</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI EXPERTISE BUILDER MODAL */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl animate-fadeIn" onClick={() => setIsAIModalOpen(false)}></div>
          <div className="relative bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] w-full max-w-2xl rounded-[40px] shadow-[0_30px_100px_rgba(79,70,229,0.18)] overflow-hidden flex flex-col max-h-[90vh] border border-indigo-100 animate-scaleUp">
            
            <div className="p-12 border-b border-slate-200 flex items-center justify-between bg-white/90 sticky top-0 z-10">
              <div className="flex items-center gap-8">
                <div className="relative group/wand">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover/wand:opacity-50 transition-opacity"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                    <Wand2 size={40} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-[1000] tracking-tighter text-slate-900">AI Architect</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                      <div className={`w-2 h-2 rounded-full ${aiStage === 1 ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Phase 0{aiStage}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAIModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-700 active:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              {aiStage === 1 ? (
                <div className="space-y-10 animate-slideUp">
                  <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 flex gap-4">
                    <div className="p-2.5 bg-white dark:bg-indigo-950 rounded-xl shrink-0 h-fit text-indigo-500 shadow-sm border border-indigo-50 dark:border-indigo-900/30">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">Intelligent Generation</h4>
                      <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
                        Our AI analyzes your input to craft a high-impact professional narrative. Provide clear details for the best results.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <AITextArea 
                      label="Your Professional Narrative" 
                      value={aiAnswers.about} 
                      onChange={(v) => setAiAnswers({...aiAnswers, about: v})}
                      placeholder="e.g. I'm a senior architect specializing in scalable microservices..."
                      icon={<User size={14} />}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Code size={14} className="text-indigo-500" />
                          Focus Areas
                        </label>
                        <button 
                          onClick={() => setSeeMoreInterests(!seeMoreInterests)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                        >
                          {seeMoreInterests ? "See Less" : "Explore All"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {(seeMoreInterests ? [
                          "Frontend", "Backend", "Fullstack", "Mobile Apps", "AI/ML", "Cloud Native", "DevOps", "Cybersecurity", "Blockchain", "Data Engineering",
                          "UI Design", "UX Research", "Product Management", "Quality Assurance", "System Design", "Microservices", "API Design", "Distributed Systems",
                          "Open Source", "Tech Blogging", "Mentorship", "Agile Leadership"
                        ] : [
                          "Frontend", "Backend", "Fullstack", "Mobile Apps", "AI/ML", "UI/UX Design", "System Design", "Cloud Native", "DevOps", "Open Source"
                        ]).map(topic => (
                          <PillButton
                            key={topic}
                            active={aiAnswers.interests?.includes(topic)}
                            onClick={() => {
                              const current = aiAnswers.interests ? aiAnswers.interests.split(", ") : [];
                              const next = current.includes(topic) ? current.filter(t => t !== topic) : [...current, topic];
                              setAiAnswers({...aiAnswers, interests: next.join(", ")});
                            }}
                            label={topic}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" />
                          Key Technologies
                        </label>
                        <button 
                          onClick={() => setSeeMoreSkills(!seeMoreSkills)}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                        >
                          {seeMoreSkills ? "See Less" : "Explore All"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {(seeMoreSkills ? [
                          "React", "Node.js", "Python", "TypeScript", "Next.js", "AWS", "Docker", "PostgreSQL", "Go", "Java", "Swift", "Kotlin", "Kubernetes", "Redis",
                          "GraphQL", "Tailwind", "Figma", "MongoDB", "Rust", "TensorFlow", "FastAPI", "Elasticsearch", "CI/CD", "Git"
                        ] : [
                          "React", "Node.js", "Python", "TypeScript", "Next.js", "AWS", "Docker", "Go", "Java", "PostgreSQL"
                        ]).map(skill => (
                          <PillButton
                            key={skill}
                            color="amber"
                            active={aiAnswers.skills?.includes(skill)}
                            onClick={() => {
                              const current = aiAnswers.skills ? aiAnswers.skills.split(", ") : [];
                              const next = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
                              setAiAnswers({...aiAnswers, skills: next.join(", ")});
                            }}
                            label={skill}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[20px] shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-5 h-5 border-3 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
                        <span className="tracking-tight italic">Drafting your profile...</span>
                      </>
                    ) : (
                      <>
                        <span className="tracking-tight">Generate Professional Profile</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                  <div className="space-y-8 animate-slideUp">
                    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(79,70,229,0.08)]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Generated Details</p>
                          <h3 className="mt-2 text-3xl font-[1000] tracking-tight text-slate-900">
                            {aiGeneratedData.description || "Generated Expertise"}
                          </h3>
                          <p className="mt-2 text-sm font-medium text-slate-600">
                            Review the generated expertise details below. You can upload this result, generate a new one, or switch to manual editing.
                          </p>
                        </div>
                        {aiGenerationSource === "fallback" && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
                            <Info size={14} />
                            Safe Draft
                          </span>
                        )}
                      </div>

                      {aiGenerationSource === "fallback" && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                          This draft was created from protected facts and fallback rules because the model output was not reliable enough to use directly.
                        </div>
                      )}

                      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <GeneratedDetailCard title="About You" icon={<User size={16} />} content={aiGeneratedData.aboutYou} />
                        <GeneratedDetailCard title="Experience" icon={<Briefcase size={16} />} content={aiGeneratedData.experience} />
                        <GeneratedDetailCard title="Projects" icon={<Zap size={16} />} content={aiGeneratedData.projects} />
                        <GeneratedDetailCard title="Achievements" icon={<Award size={16} />} content={aiGeneratedData.achievements} />
                        <GeneratedDetailCard title="Skills" icon={<Code size={16} />} skills={aiGeneratedData.skills} />
                        <GeneratedDetailCard title="Interests" icon={<Sparkles size={16} />} content={aiGeneratedData.interests} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <GeneratedDetailCard title="Email" icon={<Mail size={16} />} content={aiGeneratedData.details?.email} compact />
                        <GeneratedDetailCard title="Location" icon={<MapPin size={16} />} content={aiGeneratedData.details?.address} compact />
                      </div>
                    </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <button
                      onClick={handleAIUpload}
                      className="py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <Check size={22} className="stroke-[3]" />
                      Upload
                    </button>

                    <button
                      onClick={() => { setAiGeneratedData(null); setAiStage(1); }}
                      className="py-5 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2 text-slate-700"
                    >
                      <RotateCcw size={16} />
                      Generate New
                    </button>

                    <button
                      onClick={handleAIManualEdit}
                      className="py-5 bg-slate-100 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm flex items-center justify-center gap-2 text-slate-900"
                    >
                      <Wand2 size={16} />
                      Change Manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">

            {/* LEFT COLUMN - THE STUDIO FORM */}
            <div className="space-y-8 xl:col-span-7">

              <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-600">
                      Profile Theme
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950">Build a cleaner expertise profile</h2>
                    <p className="max-w-2xl text-sm font-medium leading-6 text-slate-600">
                      Keep the essentials crisp, use larger fields only for narrative sections, and choose a layout that matches the rest of your profile.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStat label="Template" value={`0${selectedFormat}`} />
                    <MiniStat label="Skills" value={skillList.length.toString().padStart(2, "0")} />
                    <MiniStat label="Email" value={email ? "Set" : "Empty"} />
                    <MiniStat label="Location" value={address ? "Set" : "Empty"} />
                  </div>
                </div>
              </div>

              {/* SECTION: IDENTITY */}
              <FormSection title="Professional Identity" icon={<User size={18} />}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput label="Full Name" value={name} onChange={setName} placeholder="e.g. Alex Rivera" />
                  <FormInput label="Professional Title" value={description} onChange={setDescription} placeholder="e.g. Fullstack Engineer" />
                  <FormInput label="Contact Email" value={email} onChange={setEmail} placeholder="alex@example.com" type="email" />
                  <FormInput label="Location" value={address} onChange={setAddress} placeholder="San Francisco, CA" />
                </div>
              </FormSection>

              {/* SECTION: SUMMARY */}
              <FormSection title="The Narrative" icon={<Briefcase size={18} />}>
                <div className="space-y-4">
                  <FormInput 
                    label="About You" 
                    value={aboutYou} 
                    onChange={setAboutYou} 
                    placeholder="Craft a compelling story about your career path and goals..." 
                    textarea 
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormInput label="Years of Experience" value={experience} onChange={setExperience} placeholder="e.g. 8+ years in cloud architecture" />
                    <FormInput label="Skills (comma separated)" value={skills} onChange={setSkills} placeholder="e.g. React, Node.js, AWS" />
                  </div>
                </div>
              </FormSection>

              {/* SECTION: IMPACT */}
              <FormSection title="Impact & Reach" icon={<Award size={18} />}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput 
                    label="Key Projects" 
                    value={projects} 
                    onChange={setProjects} 
                    placeholder="Highlight 2-3 significant projects and your role in them..." 
                    textarea 
                  />
                  <FormInput 
                    label="Notable Achievements" 
                    value={achievements} 
                    onChange={setAchievements} 
                    placeholder="Awards, certifications, or major milestones..." 
                    textarea 
                  />
                  <div className="md:col-span-2">
                    <FormInput label="Interests" value={interests} onChange={setInterests} placeholder="e.g. Mentorship, Open Source, Hiking" />
                  </div>
                </div>
              </FormSection>

              <div className="pt-2">
                <button
                  onClick={handleSaveClick}
                  className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-slate-900 py-4 text-base font-black text-white shadow-lg transition-all active:scale-[0.98] hover:bg-slate-800"
                >
                  <Save size={20} />
                  Update Expertise
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN - TEMPLATE PICKER */}
            <div className="space-y-6 xl:col-span-5 xl:sticky xl:top-24">

              {/* BLUEPRINT GALLERY */}
              <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Blueprint Gallery</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <LayoutTemplate size={14} /> 04 Templates
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="rounded-2xl bg-slate-900 p-2.5 text-white shadow-md">
                      <LayoutTemplate size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black tracking-tight text-slate-900">Choose a layout</h3>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                        Smaller cards, same 4 templates. The selected format will be used when you save.
                      </p>
                    </div>
                  </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 1, name: "Studio", color: "from-blue-600 to-indigo-600" },
                    { id: 2, name: "Creative", color: "from-purple-600 to-pink-600" },
                    { id: 3, name: "Minimal", color: "from-slate-700 to-black" },
                    { id: 4, name: "Impact", color: "from-indigo-600 to-cyan-500" },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedFormat(tpl.id)}
                      className={`relative group flex flex-col overflow-hidden rounded-[22px] border transition-all duration-300 ${
                        selectedFormat === tpl.id 
                          ? "border-slate-900 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-200 bg-white">
                        <div className="absolute inset-0 origin-top-left scale-[0.17] h-[588%] w-[588%] pointer-events-none opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                          <MyExperties expertise={{ ...currentExpertiseDraft, format: tpl.id }} />
                        </div>
                        {selectedFormat === tpl.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl animate-scaleUp">
                              <Check size={20} className="stroke-[3]" />
                            </div>
                          </div>
                        )}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tpl.color} opacity-70`} />
                      </div>
                      <div className="flex items-center justify-between px-3 py-3">
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Template 0{tpl.id}</p>
                          <p className={`mt-1 text-sm font-bold ${selectedFormat === tpl.id ? "text-slate-950" : "text-slate-700"}`}>
                            {tpl.name}
                          </p>
                        </div>
                        {selectedFormat === tpl.id && (
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* CONFIRMATION MODAL */}
      <Confirmation
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeUpload}
        title="Finalize Portfolio?"
        confirmText="Push Changes"
        confirmColor="bg-indigo-600 hover:bg-indigo-700"
      />

      {/* SAVING OVERLAY */}
      {isSaving && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-slate-200 dark:border-slate-800 animate-scaleUp">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Synching Profile</p>
              <p className="text-sm text-slate-500 font-medium">Updating your global professional presence...</p>
            </div>
          </div>
        </div>
      )}

      {/* SNACKBAR */}
      {snackbar.open && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[20px] shadow-2xl text-white font-bold animate-slideUp z-[300] flex items-center gap-4 border-t-2 border-white/20 backdrop-blur-xl
          ${snackbar.type === "success" ? "bg-emerald-600/95 shadow-emerald-500/20" : "bg-rose-600/95 shadow-rose-500/20"}`}
        >
          <div className="p-1.5 bg-white/20 rounded-lg">
            {snackbar.type === "success" ? <Check size={16} /> : <Info size={16} />}
          </div>
          <span className="tracking-tight">{snackbar.message}</span>
          <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// HELPER COMPONENTS
const FormSection = ({ title, icon, children }) => (
  <div className="space-y-4 animate-slideUp">
    <div className="flex items-center gap-4 group/sec">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition-all duration-300 group-hover/sec:border-slate-300">
        {icon}
      </div>
      <h3 className="cursor-default text-lg font-black tracking-tight text-slate-950 transition-colors">{title}</h3>
    </div>
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-slate-300">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-indigo-50 blur-[70px]" />
      {children}
    </div>
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, type = "text", textarea = false }) => (
  <div className="space-y-2 group">
    <label className="ml-1 cursor-text text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 transition-colors group-focus-within:text-slate-900">{label}</label>
    {textarea ? (
      <textarea
        className="min-h-[112px] w-full resize-none rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all hover:border-slate-300 hover:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        type={type}
        className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all hover:border-slate-300 hover:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

const AITextArea = ({ label, value, onChange, placeholder, icon }) => (
  <div className="space-y-3">
    <label className="ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
      {icon}
      {label}
    </label>
    <textarea
      className="min-h-[112px] w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const PillButton = ({ label, active, onClick, color = "indigo" }) => {
  const activeClass = color === "indigo" 
    ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.03]" 
    : "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.03]";
  const inactiveClass = "border-slate-200 bg-white text-slate-600 hover:border-slate-300";

  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-black tracking-tight transition-all ${active ? activeClass : inactiveClass}`}
    >
      {label}
    </button>
  );
};

const GeneratedDetailCard = ({ title, content, skills, icon, compact = false }) => (
  <div className={`rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 ${compact ? "" : "min-h-[160px]"}`}>
    <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">
      {icon}
    </div>
    <div className="mt-4 min-w-0">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{title}</p>
      {skills ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(skills || []).map((skill, index) => (
            <span key={`${skill}-${index}`} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
              {skill}
            </span>
          ))}
          {(!skills || skills.length === 0) && (
            <p className="text-sm font-medium text-slate-500">Not provided</p>
          )}
        </div>
      ) : (
        <p className={`${compact ? "truncate" : "line-clamp-5"} mt-2 text-sm font-medium leading-relaxed text-slate-700`}>
          {content || "Not provided"}
        </p>
      )}
    </div>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default ExpertisePage;
