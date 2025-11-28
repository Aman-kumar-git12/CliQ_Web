import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Check, LayoutTemplate, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confirmation from "../Confirmation";

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

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const res = await axiosClient.get("/profile", { withCredentials: true });
        const user = res.data.user;
        if (user && user.expertise) {
          const exp = user.expertise;
          // Always force name to be firstname + lastname
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
          if (exp.format) {
            setSelectedFormat(exp.format);
          }
        } else if (user) {
          // Pre-fill name/email from user profile if expertise doesn't exist yet
          setName(`${user.firstname} ${user.lastname}`);
          setEmail(user.email);
        }
      } catch (err) {
        console.error("Failed to fetch expertise:", err);
      }
    };
    fetchExpertise();
  }, []);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 3000);
  };

  const handleSaveClick = () => {
    if (!selectedFormat) return showSnackbar("Please select a format", "error");
    setShowConfirm(true);
  };

  const executeUpload = async () => {
    setShowConfirm(false);
    setIsSaving(true); // Start loading

    const payload = {
      name,
      description,
      experience,
      skills: skills.split(",").map(s => s.trim()).filter(s => s),
      projects,
      achievements,
      interests,
      aboutYou,
      details: {
        email,
        address
      },
      format: selectedFormat,
    };

    try {
      // Simulate a small delay for the "cute" effect if the API is too fast
      await new Promise(resolve => setTimeout(resolve, 1500));
      await axiosClient.put("/profile/expertise", payload);

      setIsSaving(false); // Stop loading
      showSnackbar("Expertise saved successfully!", "success");

      // Navigate to profile after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 1000);

    } catch (err) {
      console.error(err);
      setIsSaving(false);
      showSnackbar("Failed to save expertise", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300 relative">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">

        <header className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Edit Expertise</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your professional profile and choose a layout.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-7 space-y-8">

            {/* Personal Info */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
                <InputGroup label="Role / Title" value={description} onChange={setDescription} placeholder="Senior Frontend Developer" />
                <InputGroup label="Email" value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
                <InputGroup label="Address" value={address} onChange={setAddress} placeholder="San Francisco, CA" />
              </div>
            </section>

            {/* About & Experience */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Professional Summary
              </h2>
              <InputGroup label="About You" value={aboutYou} onChange={setAboutYou} placeholder="Brief bio..." textarea />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Experience" value={experience} onChange={setExperience} placeholder="5+ years in React..." />
                <InputGroup label="Skills (comma separated)" value={skills} onChange={setSkills} placeholder="React, Node.js, Python..." />
              </div>
            </section>

            {/* Details */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Additional Info
              </h2>
              <InputGroup label="Projects" value={projects} onChange={setProjects} placeholder="E-commerce App, AI Chatbot..." textarea />
              <InputGroup label="Achievements" value={achievements} onChange={setAchievements} placeholder="Hackathon Winner, Best Employee..." textarea />
              <InputGroup label="Interests" value={interests} onChange={setInterests} placeholder="Reading, Hiking, Gaming..." />
            </section>

            <button
              onClick={handleSaveClick}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-[0.98]"
            >
              Save & Update Profile
            </button>

          </div>

          {/* RIGHT COLUMN - TEMPLATES */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <LayoutTemplate size={20} />
                Select Template
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((id) => (
                  <div
                    key={id}
                    onClick={() => setSelectedFormat(id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${selectedFormat === id
                        ? "border-blue-500 bg-white dark:bg-[#1a1a1a] shadow-md"
                        : "border-transparent bg-gray-100 dark:bg-[#111] hover:bg-gray-200 dark:hover:bg-[#222]"
                      }`}
                  >
                    {selectedFormat === id && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white p-1 rounded-full z-10">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}

                    <h3 className={`font-bold mb-2 ${selectedFormat === id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                      Template {id}
                    </h3>

                    {/* Mini Preview */}
                    <div className="opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {id === 1 && (
                        <div className="bg-white border border-gray-200 p-3 rounded text-black text-xs shadow-sm">
                          <div className="font-bold">{name || "Name"}</div>
                          <div className="text-gray-500">{description || "Role"}</div>
                        </div>
                      )}
                      {id === 2 && (
                        <div className="flex bg-white border border-gray-200 rounded overflow-hidden text-black text-xs shadow-sm">
                          <div className="w-1 bg-blue-500"></div>
                          <div className="p-3">
                            <div className="font-bold">{name || "Name"}</div>
                            <div className="text-gray-500">{description || "Role"}</div>
                          </div>
                        </div>
                      )}
                      {id === 3 && (
                        <div className="bg-gray-900 p-3 rounded text-white text-xs border border-gray-700 shadow-sm">
                          <div className="font-bold">{name || "Name"}</div>
                          <div className="text-gray-400">{description || "Role"}</div>
                        </div>
                      )}
                      {id === 4 && (
                        <div className="bg-white border border-gray-200 p-3 rounded text-black text-xs border-t-4 border-t-blue-600 shadow-sm">
                          <div className="font-bold">{name || "Name"}</div>
                          <div className="text-gray-500">{description || "Role"}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
        title="Save Changes?"
        confirmText="Yes, Save"
        confirmColor="bg-blue-600 hover:bg-blue-700"
      />

      {/* SAVING OVERLAY */}
      {isSaving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            <p className="text-sm font-medium text-black dark:text-white">Saving...</p>
          </div>
        </div>
      )}

      {/* SNACKBAR */}
      {snackbar.open && (
        <div className={`fixed bottom-24 left-5 right-5 md:bottom-5 md:left-auto md:right-5 md:w-auto px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-fadeIn z-50 flex items-center justify-between md:justify-start gap-3
          ${snackbar.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          <span>{snackbar.message}</span>
          <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="hover:bg-white/20 rounded-full p-1">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = "text", textarea = false, disabled = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    {textarea ? (
      <textarea
        className={`bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-black dark:text-white caret-blue-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        rows={6}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    ) : (
      <input
        type={type}
        className={`bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-black dark:text-white caret-blue-500 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    )}
  </div>
);

export default ExpertisePage;
