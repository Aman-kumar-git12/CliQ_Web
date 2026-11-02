/*
 * TODO BEFORE LAUNCH: this is a generic template, not legal advice. Have the text reviewed (ideally by a lawyer
 * for the regions CliQ serves), set the minimum age and governing law, and fill in the [contact email] and
 * [effective date] placeholders.
 */
import { Link } from "react-router-dom";
import LegalPageLayout, { LegalSection } from "../components/legal/LegalPageLayout";

const CONTACT_EMAIL = "[contact email]";
const EFFECTIVE_DATE = "[effective date]";

export default function TermsPage() {
    return (
        <LegalPageLayout
            title="Terms of Service"
            effectiveDate={EFFECTIVE_DATE}
            intro={
                <p>
                    These terms are the agreement between you and CliQ for using the CliQ website and apps. By creating
                    an account or using CliQ you agree to them and to our{" "}
                    <Link to="/privacy" className="text-brand-light underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
            }
        >
            <LegalSection title="1. Your account">
                <ul>
                    <li>You must be at least 16 years old (or the minimum age required where you live).</li>
                    <li>Give accurate information, including your real name and a working email address.</li>
                    <li>Keep your password secret. You are responsible for activity on your account.</li>
                    <li>One person per account; do not impersonate anyone or create accounts by automated means.</li>
                </ul>
            </LegalSection>

            <LegalSection title="2. Your content">
                <p>
                    You own the posts, comments, messages, media and profile information you share. You give CliQ a
                    worldwide, non-exclusive, royalty-free licence to host, store, display and distribute that content
                    only as needed to operate and improve the service. This licence ends when you delete the content or
                    your account, except for copies others already received or that we must keep by law.
                </p>
                <p>Only share content you have the right to share.</p>
            </LegalSection>

            <LegalSection title="3. Acceptable use">
                <p>Do not use CliQ to:</p>
                <ul>
                    <li>harass, threaten, bully or discriminate against anyone;</li>
                    <li>post illegal, hateful, sexually explicit or violent content;</li>
                    <li>send spam, scams, unsolicited advertising or misleading information;</li>
                    <li>infringe others&apos; intellectual property or privacy;</li>
                    <li>
                        scrape, overload, probe or bypass the security of the service, or access accounts that are not
                        yours.
                    </li>
                </ul>
                <p>
                    You can report posts and members in the app. We may remove content or suspend accounts that break
                    these terms.
                </p>
            </LegalSection>

            <LegalSection title="4. AI features">
                <p>
                    CliQ offers optional AI features such as connection suggestions, reply suggestions and an assistant.
                    When you use them, the relevant text is processed by our AI provider as described in the Privacy
                    Policy. AI output can be wrong or incomplete: review it before relying on or sending it. You are
                    responsible for what you post or send, including AI-suggested text.
                </p>
            </LegalSection>

            <LegalSection title="5. The service">
                <p>
                    We work to keep CliQ available and secure, but the service is provided &quot;as is&quot; and may
                    change, be interrupted or have errors. We may add, change or remove features at any time.
                </p>
            </LegalSection>

            <LegalSection title="6. Ending your account">
                <p>
                    You can stop using CliQ and delete your account at any time from Settings &gt; Delete account. We
                    may suspend or close accounts that break these terms or put other members or the service at risk. A
                    blocked account can ask for a review from the sign-in screen.
                </p>
            </LegalSection>

            <LegalSection title="7. Liability">
                <p>
                    To the extent the law allows, CliQ is not liable for indirect or consequential losses, or for
                    content and conduct of other members. Nothing in these terms limits rights you have under laws that
                    cannot be waived.
                </p>
            </LegalSection>

            <LegalSection title="8. Changes and contact">
                <p>
                    We may update these terms. We will change the effective date above and, for significant changes,
                    tell you in the app or by email; continuing to use CliQ means you accept the new terms. Questions:{" "}
                    {CONTACT_EMAIL}.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}
