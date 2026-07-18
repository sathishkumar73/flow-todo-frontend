import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Flow Todo',
  description: 'Privacy policy for Flow Todo.',
}

const ink = '#E8E8F0'
const ink2 = 'rgba(232,232,240,0.62)'
const ink3 = 'rgba(232,232,240,0.38)'
const border = 'rgba(255,255,255,0.07)'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#07070F' }}>
      <header className="border-b py-4" style={{ borderColor: border }}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold"
            style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Flow Todo
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4" style={{ color: ink }}>Privacy Policy</h1>
        <p className="text-sm mb-12" style={{ color: ink3 }}>Last updated: July 18, 2026</p>

        <div className="space-y-10" style={{ color: ink2 }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>1. Information We Collect</h2>
            <p>We collect information you provide directly: your name and email address when you sign in with Google, and the tasks and notes you create in the Service. We also collect usage data (pages visited, features used) to improve the product.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the Service, authenticate your account, send important service updates, and analyze usage patterns to make Flow Todo better. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>3. Data Storage and Security</h2>
            <p>Your data is stored on secure cloud infrastructure (Neon PostgreSQL). We use industry-standard encryption for data in transit (HTTPS/TLS). While we take reasonable precautions, no system is completely secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>4. Authentication</h2>
            <p>We use Clerk for authentication, which supports Google OAuth sign-in. We do not store your Google password. Clerk's privacy policy applies to authentication data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>5. Cookies</h2>
            <p>We use cookies for authentication session management (required for the Service to function) and analytics (PostHog, to understand usage). You can disable analytics cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>6. Third-Party Services</h2>
            <p>We use the following third-party services: Clerk (authentication), Neon (database), Railway (backend hosting), Vercel (frontend hosting), and PostHog (analytics). Each has their own privacy policy governing their data practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>7. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time. To delete your account and all associated data, contact us at <a href="mailto:hello@flowtodo.app" style={{ color: '#60A5FA' }}>hello@flowtodo.app</a>. We will process requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>8. Data Retention</h2>
            <p>We retain your data as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or in-app notice. Continued use of the Service constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>10. Contact</h2>
            <p>For privacy questions or data requests, contact us at <a href="mailto:hello@flowtodo.app" style={{ color: '#60A5FA' }}>hello@flowtodo.app</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${border}` }}>
          <Link href="/terms" style={{ color: '#60A5FA' }}>Terms of Service</Link>
          <span className="mx-3" style={{ color: ink3 }}>·</span>
          <Link href="/" style={{ color: ink3 }}>Back to Flow Todo</Link>
        </div>
      </main>
    </div>
  )
}
