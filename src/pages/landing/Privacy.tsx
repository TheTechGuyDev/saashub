export default function Privacy() {
  return (
    <section className="py-20">
      <div className="prose prose-slate mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: March 1, 2026</p>

        <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide when registering, using our services, or contacting support. This includes your name, email, company details, and usage data.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use your data to provide and improve our services, send important notifications, process payments, and provide customer support.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
            <p>Your data is stored on secure, encrypted servers. We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, and regular security audits.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
            <p>We do not sell your personal data. We may share data with trusted service providers who help us operate our platform, subject to strict confidentiality agreements.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">5. Data Isolation</h2>
            <p>SaaSHub uses a multi-tenant architecture with strict data isolation. Each company's data is separated and protected by row-level security policies.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@saashub.com to exercise these rights.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p>For privacy-related inquiries, email us at privacy@saashub.com.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
