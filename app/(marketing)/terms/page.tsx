import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Flow Todo.',
  alternates: { canonical: 'https://flowtodo.app/terms' },
  robots: { index: false, follow: true },
}

const ink = '#E8E8F0'
const ink2 = 'rgba(232,232,240,0.62)'
const ink3 = 'rgba(232,232,240,0.38)'
const border = 'rgba(255,255,255,0.07)'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-4" style={{ color: ink }}>Terms of Service</h1>
        <p className="text-sm mb-12" style={{ color: ink3 }}>Last updated: July 18, 2026</p>

        <div className="space-y-10" style={{ color: ink2 }}>
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>1. Acceptance of Terms</h2>
            <p>By accessing or using Flow Todo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>2. Use of the Service</h2>
            <p>Flow Todo is a task management tool that helps you prioritize your work using an automated scoring system. You may use the Service for personal and professional productivity purposes. You agree not to misuse the Service or help anyone else do so.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>3. Your Account</h2>
            <p>You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>4. Your Data</h2>
            <p>Your tasks and data belong to you. We store your data to provide the Service and will not sell it to third parties. You can delete your account and data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>5. Subscription and Billing</h2>
            <p>Flow Todo offers a free tier and a paid Pro plan. Paid subscriptions are billed monthly or annually. You may cancel at any time; cancellation takes effect at the end of the current billing period. We do not offer refunds for partial periods.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>6. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranty of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or completely secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>7. Limitation of Liability</h2>
            <p>To the extent permitted by law, Flow Todo and its owners shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or in-app notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: ink }}>9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:hello@flowtodo.app" style={{ color: '#60A5FA' }}>hello@flowtodo.app</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8" style={{ borderTop: `1px solid ${border}` }}>
          <Link href="/privacy" style={{ color: '#60A5FA' }}>Privacy Policy</Link>
          <span className="mx-3" style={{ color: ink3 }}>·</span>
          <Link href="/" style={{ color: ink3 }}>Back to Flow Todo</Link>
        </div>
      </main>
    </div>
  )
}
