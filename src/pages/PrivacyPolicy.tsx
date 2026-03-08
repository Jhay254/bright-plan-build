import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Echo</title>
        <meta name="description" content="Echo's privacy policy: what data we collect, how we use it, retention periods, and your rights." />
        <meta property="og:title" content="Privacy Policy — Echo" />
        <meta property="og:description" content="Echo's privacy policy: what data we collect, how we use it, retention periods, and your rights." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

          <div className="prose prose-sm max-w-none space-y-8 text-foreground/90">
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">1. What We Collect</h2>
              <p>Echo collects the minimum data needed to provide peer-support services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account data:</strong> Email address (or anonymous session), alias, avatar seed, language preference.</li>
                <li><strong>Profile data:</strong> Healing goals and cultural context (optional, user-provided).</li>
                <li><strong>Journal entries:</strong> Title, content, mood, tags, and milestone labels — stored encrypted at rest.</li>
                <li><strong>Session metadata:</strong> Topic, urgency level, language, status, and timestamps.</li>
                <li><strong>Session messages:</strong> Chat messages exchanged during support sessions.</li>
                <li><strong>Feedback:</strong> Emotional ratings and reflections submitted after sessions.</li>
                <li><strong>Volunteer data:</strong> Background, motivation, specialisations, training progress, availability, and CPD logs.</li>
                <li><strong>Consent record:</strong> Timestamp of when you accepted this privacy policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">2. How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To match you with appropriate peer-support volunteers.</li>
                <li>To provide journaling and mood-tracking features.</li>
                <li>To detect crisis situations and surface emergency resources.</li>
                <li>To generate aggregate statistics for platform improvement (never individual data).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">3. Cookies &amp; Local Storage</h2>
              <p>Echo uses <strong>essential cookies only</strong>:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Authentication token:</strong> A secure, HTTP-only cookie that keeps you signed in. It is required for the app to function and expires when you sign out.</li>
                <li><strong>Cookie notice preference:</strong> A localStorage flag recording that you dismissed the cookie banner. No personal data is stored.</li>
              </ul>
              <p>Echo does <strong>not</strong> use any analytics, advertising, or third-party tracking cookies.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">4. Consent</h2>
              <p>By creating an account (email-based or anonymous), you explicitly consent to this privacy policy. Your consent timestamp is recorded in your profile. You may withdraw consent at any time by deleting your account.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">5. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Session messages:</strong> Content is automatically purged <strong>90 days</strong> after a session closes. Messages are replaced with a retention notice.</li>
                <li><strong>Session metadata:</strong> Topic, timestamps, and status are retained for service improvement.</li>
                <li><strong>Journal entries:</strong> Retained until you delete them or delete your account.</li>
                <li><strong>Profile data:</strong> Retained until you delete your account.</li>
                <li><strong>Stale sessions:</strong> Unmatched sessions are auto-cancelled after 24 hours. Inactive active sessions are closed after 4 hours.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Export your data:</strong> Download a complete JSON export of your profile, journal entries, session metadata, and feedback from your <Link to="/app/profile" className="text-primary underline">profile page</Link>.</li>
                <li><strong>Delete your account:</strong> Permanently remove all your data from our systems via the account deletion option on your profile page. This action is irreversible.</li>
                <li><strong>Remain anonymous:</strong> Use Echo without providing an email address. Anonymous accounts receive the same features and protections.</li>
                <li><strong>Withdraw consent:</strong> Delete your account at any time to withdraw your consent to data processing.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">7. Data Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>All data is transmitted over HTTPS/TLS.</li>
                <li>Data is stored encrypted at rest.</li>
                <li>Row-level security ensures users can only access their own data.</li>
                <li>Session rate limits prevent abuse (3 active sessions max, 60 messages/minute).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">8. Third Parties</h2>
              <p>Echo does not sell, share, or monetise your personal data. We do not use third-party analytics or advertising trackers.</p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground">9. Contact</h2>
              <p>For privacy concerns or data requests, reach out through the Echo platform or email <span className="text-primary">privacy@projectecho.org</span>.</p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Project Echo. Free forever for seekers.
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
