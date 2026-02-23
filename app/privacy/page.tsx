import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Character Forge',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>Character Forge collects minimal information necessary to provide our service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Character Data:</strong> Usernames/identifiers used to generate characters are stored in our database.</li>
              <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our service.</li>
              <li><strong>Technical Data:</strong> IP addresses and browser information may be logged for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Generate and display procedural characters</li>
              <li>Maintain the character gallery</li>
              <li>Improve and optimize our service</li>
              <li>Protect against abuse and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage</h2>
            <p>Generated characters and their associated identifiers are stored securely in our database. We implement appropriate security measures to protect your data from unauthorized access or disclosure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Cookies</h2>
            <p>Character Forge may use essential cookies to ensure proper functionality of the service. We do not use tracking cookies or third-party analytics without your consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p>Our service may use third-party services for hosting and content delivery. These providers have their own privacy policies, and we encourage you to review them.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>Characters generated through our service are stored indefinitely unless removed at our discretion or upon request. We may remove content that violates our Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access information about data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your personal data</li>
            </ul>
            <p className="mt-2">To exercise these rights, please contact us through our social media channels.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Children&apos;s Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us through our social media channels.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
