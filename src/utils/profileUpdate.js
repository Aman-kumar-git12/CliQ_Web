/**
 * The PUT /profile/edit body for the edit-profile form: only the fields that changed. The server validates
 * every field it receives, so resending an unchanged value that today's rules reject (a Google account
 * with an empty last name, an old account's age) would block saving anything else.
 * The email has its own verified flow (ChangeEmailPanel); a new password goes with the current one.
 * @param {{ firstname: string, lastname: string, age: string | number, imageUrl: string, password: string, currentPassword: string }} form
 * @param {{ firstname?: string, lastname?: string, age?: string | number, imageUrl?: string }} [original] the loaded profile
 * @returns {object}
 */
export const buildProfileUpdate = (form, original = {}) => {
    const update = {};
    const changed = (field) => String(form[field] ?? "").trim() !== String(original[field] ?? "").trim();

    if (changed("firstname")) update.firstname = form.firstname.trim();
    if (changed("lastname")) update.lastname = form.lastname.trim();
    if (changed("age") && String(form.age ?? "").trim() !== "") update.age = Number(form.age);
    if (changed("imageUrl") && form.imageUrl) update.imageUrl = form.imageUrl.trim();
    if (form.password) {
        update.password = form.password;
        if (form.currentPassword) update.currentPassword = form.currentPassword;
    }
    return update;
};
