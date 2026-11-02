/*
 * TODO BEFORE LAUNCH: this is a generic template, not legal advice. Have the text reviewed (ideally by a lawyer
 * for the regions CliQ serves), fill in the [contact email] and [effective date] placeholders, and keep the
 * list of providers in sync with the backend whenever a service is added or removed.
 */
import { Link } from "react-router-dom";
import LegalPageLayout, { LegalSection } from "../components/legal/LegalPageLayout";

const CONTACT_EMAIL = "[contact email]";
const EFFECTIVE_DATE = "[effective date]";

export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout
            title="Privacy Policy"
            effectiveDate={EFFECTIVE_DATE}
            intro={
                <p>
                    CliQ is a professional network for sharing work, showing your expertise and connecting with people.
                    This policy explains what we collect when you use CliQ, why, who helps us run the service, and the
                    choices you have.
                </p>
            }
        >
            <LegalSection title="1. Information we collect">
                <p>
                    <strong>Account details:</strong> your name, email address, age and password (stored only as a
                    secure hash). If you sign in with Google we receive your name, email and profile photo from Google.
                </p>
                <p>
                    <strong>Profile and expertise:</strong> your photo, headline, skills, interests, experience,
                    projects and anything else you add to your profile or Expertise Studio.
                </p>
                <p>
                    <strong>Content you create:</strong> posts, comments, likes, reposts, media you upload, and the
                    messages you send in chat.
                </p>
                <p>
                    <strong>Your network:</strong> connection requests, connections, saved posts and the profiles you
                    save, skip or show interest in on the matching screen.
                </p>
                <p>
                    <strong>Technical data:</strong> basic request information such as IP address, browser type and
                    timestamps that our servers log to keep the service secure and working.
                </p>
            </LegalSection>

            <LegalSection title="2. How we use it">
                <ul>
                    <li>to create and secure your account and keep you signed in;</li>
                    <li>to show your profile and posts to other members and deliver your messages;</li>
                    <li>to suggest relevant connections based on your profile and activity;</li>
                    <li>to provide optional AI features such as reply suggestions and the CliQ assistant;</li>
                    <li>to send account emails such as verification codes and password resets;</li>
                    <li>to prevent abuse, review reports and enforce our Terms.</li>
                </ul>
                <p>We do not sell your personal information and we do not show third-party advertising.</p>
            </LegalSection>

            <LegalSection title="3. Cookies">
                <p>
                    CliQ uses a single essential cookie: an httpOnly authentication cookie that keeps you logged in. It
                    cannot be read by scripts on the page and is removed when you log out or it expires. We do not use
                    advertising, analytics or tracking cookies. The app also stores small preferences (for example
                    whether the intro screen was shown) in your browser&apos;s local storage.
                </p>
            </LegalSection>

            <LegalSection title="4. Service providers">
                <p>We share data only with providers that help us run CliQ, and only what they need:</p>
                <ul>
                    <li>
                        <strong>MongoDB Atlas</strong> stores our database (accounts, profiles, posts, messages and
                        connections).
                    </li>
                    <li>
                        <strong>Cloudinary</strong> stores and serves images, videos and other media you upload.
                    </li>
                    <li>
                        <strong>Brevo</strong> sends account emails such as verification codes and password resets.
                    </li>
                    <li>
                        <strong>Groq</strong> runs our AI features. When you use them, the relevant text (for example
                        the messages in a conversation, your prompt, or profile and expertise text) is sent to Groq to
                        generate a response.
                    </li>
                    <li>
                        <strong>Vercel and Render</strong> host the CliQ website and servers.
                    </li>
                    <li>
                        <strong>Google</strong>, only if you choose to sign in with Google.
                    </li>
                </ul>
                <p>
                    These providers may process data in countries other than your own. We may also disclose information
                    when required by law or to protect the safety of our members.
                </p>
            </LegalSection>

            <LegalSection title="5. What other members can see">
                <p>
                    Your name, photo, profile, expertise and posts are visible to other CliQ members. Messages are
                    visible to the people in the conversation. Content you delete is removed from the app; copies others
                    have already received (such as messages) may remain with them.
                </p>
            </LegalSection>

            <LegalSection title="6. How long we keep data">
                <p>
                    We keep your data while your account is active. When you delete your account we delete your profile
                    and content from our live systems; limited records may be kept for a short period in backups or
                    where needed for security, legal or abuse-prevention reasons.
                </p>
            </LegalSection>

            <LegalSection title="7. Your rights and choices">
                <ul>
                    <li>
                        <strong>Access and correction:</strong> view and edit your information at any time from your
                        profile and <Link to="/settings">Settings</Link>.
                    </li>
                    <li>
                        <strong>Export:</strong> download a copy of your data from Settings.
                    </li>
                    <li>
                        <strong>Deletion:</strong> delete your account and its data from Settings &gt; Delete account.
                    </li>
                    <li>
                        <strong>Objection and other requests:</strong> contact us at {CONTACT_EMAIL}. Depending on where
                        you live you may also have the right to complain to your data-protection authority.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="8. Security">
                <p>
                    Passwords are hashed, connections to CliQ are encrypted (HTTPS) and the session cookie is httpOnly.
                    No system is perfectly secure, so please use a strong, unique password.
                </p>
            </LegalSection>

            <LegalSection title="9. Age">
                <p>
                    CliQ is not intended for children. You must meet the minimum age stated in our{" "}
                    <Link to="/terms">Terms of Service</Link> to create an account.
                </p>
            </LegalSection>

            <LegalSection title="10. Changes and contact">
                <p>
                    If we change this policy we will update the effective date above and, for significant changes, let
                    you know in the app or by email. Questions or requests: {CONTACT_EMAIL}.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}
