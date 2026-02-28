import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Diario del Junior',
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
          <section className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-3">Important Disclaimer</h2>
            <p className="text-sm">
              <strong>Diario del Junior is not affiliated with, endorsed, sponsored, or specifically approved by Sulake Suomi or its affiliates.</strong> 
              Diario del Junior may use the trademarks and other intellectual property of Habbo, which is permitted under the{' '}
              <a 
                href="https://help.habbo.com/hc/en-us/articles/115005631069-Habbo-Fan-Site-Policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Habbo Fan Site Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">About This Project</h2>
            <p>
              Diario del Junior is a personal, indie project — not a company or commercial service. 
              This privacy policy explains what data is involved in a simple and transparent way.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What Data We Store</h2>
            <p>The application stores the following data to display characters:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Public usernames</strong> — used as the basis for character generation</li>
              <li><strong>Generation seed</strong> — a number derived from the username</li>
              <li><strong>Character parts</strong> — which visual components were selected</li>
              <li><strong>Creation date</strong> — when the character was generated</li>
            </ul>
            <p className="mt-3">
              All usernames are public usernames from social platforms. We do not collect private personal data, emails, or any information you submit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What We Don&apos;t Collect</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>No IP addresses</li>
              <li>No cookies for tracking</li>
              <li>No user accounts or login data</li>
              <li>No analytics or third-party trackers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Hosting Infrastructure</h2>
            <p>
              This service is hosted on a third-party platform (Render). 
              The hosting provider may log technical data such as request times and error reports for their own operational purposes. 
              This is outside of our application and controlled by their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
            <p>
              Since we only store public usernames (not personal data), most data protection rights do not apply. 
              However, if you have questions or concerns, you can reach out through my social media channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Children</h2>
            <p>
              This service is not directed at children under 13. No personal information is knowingly collected from anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Changes</h2>
            <p>
              This policy may be updated as the project evolves. Check the &quot;Last updated&quot; date for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p>
              Questions? Reach out through my social media channels.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
