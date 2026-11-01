/** Left column of the Expertise Studio: intro stats card, identity/narrative/impact sections and save button. */
import { Award, Briefcase, Save, User } from "lucide-react";
import FormInput from "./FormInput";
import FormSection from "./FormSection";
import MiniStat from "./MiniStat";

const ExpertiseStudioForm = ({ form, selectedFormat, skillList, onSave }) => {
    const {
        name,
        setName,
        description,
        setDescription,
        experience,
        setExperience,
        skills,
        setSkills,
        projects,
        setProjects,
        achievements,
        setAchievements,
        interests,
        setInterests,
        aboutYou,
        setAboutYou,
        email,
        setEmail,
        address,
        setAddress,
    } = form;

    return (
        <>
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex w-fit items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-600">
                            Profile Theme
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950">
                            Build a cleaner expertise profile
                        </h2>
                        <p className="max-w-2xl text-sm font-medium leading-6 text-slate-600">
                            Keep the essentials crisp, use larger fields only for narrative sections, and choose a
                            layout that matches the rest of your profile.
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
                    <FormInput
                        label="Professional Title"
                        value={description}
                        onChange={setDescription}
                        placeholder="e.g. Fullstack Engineer"
                    />
                    <FormInput
                        label="Contact Email"
                        value={email}
                        onChange={setEmail}
                        placeholder="alex@example.com"
                        type="email"
                    />
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
                        <FormInput
                            label="Years of Experience"
                            value={experience}
                            onChange={setExperience}
                            placeholder="e.g. 8+ years in cloud architecture"
                        />
                        <FormInput
                            label="Skills (comma separated)"
                            value={skills}
                            onChange={setSkills}
                            placeholder="e.g. React, Node.js, AWS"
                        />
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
                        <FormInput
                            label="Interests"
                            value={interests}
                            onChange={setInterests}
                            placeholder="e.g. Mentorship, Open Source, Hiking"
                        />
                    </div>
                </div>
            </FormSection>

            <div className="pt-2">
                <button
                    onClick={onSave}
                    className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-slate-900 py-4 text-base font-black text-white shadow-lg transition-all active:scale-[0.98] hover:bg-slate-800"
                >
                    <Save size={20} />
                    Update Expertise
                </button>
            </div>
        </>
    );
};

export default ExpertiseStudioForm;
