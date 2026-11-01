/** Form field state for the Expertise Studio page, plus a helper to fill the fields from an expertise object. */
import { useState } from "react";

export function useExpertiseStudioFields() {
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

    // Copies every expertise field except name/format into the form (used by profile load and AI "Change Manually")
    const applyExpertiseFields = (exp) => {
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
    };

    return {
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
        applyExpertiseFields,
    };
}
