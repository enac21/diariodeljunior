import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Diario del Junior',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Diario del Junior (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>Diario del Junior is an interactive map where you can explore procedurally generated characters. The service displays unique SVG characters created through an algorithmic process and allows users to navigate and discover them.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Conduct</h2>
            <p>While using the Service, you agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Attempt to reverse engineer or extract the character generation algorithm</li>
              <li>Use automated tools or bots to scrape or mass-download content</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
            <p>The characters displayed on Diario del Junior are created through a procedural generation system developed for the Service. The Service, its content, features, and functionality are owned by Diario del Junior and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
            <p>Diario del Junior is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Modifications</h2>
            <p>We reserve the right to modify or discontinue the Service at any time without notice. We may also revise these Terms of Service at any time. Your continued use of the Service constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>If you have any questions about these Terms, please contact us through our social media channels.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
