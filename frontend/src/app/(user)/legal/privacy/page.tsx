import { config } from "@/constants/config";

export const metadata = {
  title: "Privacy Policy | OotyDogs",
  description: "How OotyDogs collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-brand-green-soft py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: November 28, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Welcome to {config.appName} (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are based in {config.contact.location} and operate
                a pet listing marketplace at ootydogs.com. We are committed to protecting your personal information
                and your right to privacy.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By using our website and services you agree to the collection and use of information in accordance
                with this Privacy Policy. If you disagree with any part, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-slate-700 mb-3">2.1 Personal Information</h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                When you register or use our platform you may provide:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4 mb-4">
                <li>Name, email address, and phone number</li>
                <li>City and state (for listing location)</li>
                <li>Pet details, photos, and descriptions you include in a listing</li>
                <li>Payment information processed securely through Razorpay</li>
                <li>Messages and enquiries sent through our platform</li>
              </ul>
              <h3 className="text-xl font-medium text-slate-700 mb-3 mt-5">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>IP address, browser type, and device information</li>
                <li>Pages visited, time spent, and referring URLs</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>To create and manage your account</li>
                <li>To publish and manage your pet, service, and product listings</li>
                <li>To process subscription payments via Razorpay</li>
                <li>To send account-related notifications (listing status, enquiries)</li>
                <li>To improve our platform and prevent fraud</li>
                <li>To respond to your support requests</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Information Sharing</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li><strong>Other users</strong> — only the contact details you choose to show on a listing</li>
                <li><strong>Razorpay</strong> — for secure payment processing</li>
                <li><strong>Cloudinary</strong> — for image storage and delivery</li>
                <li><strong>Law enforcement</strong> — when required by law or to protect safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                We use essential cookies to keep you logged in and maintain your session. We may also use analytics
                cookies to understand how visitors use our site. You can disable cookies in your browser settings,
                though some features may not work correctly without them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                We use industry-standard security measures including HTTPS, encrypted storage, and access controls
                to protect your data. However, no method of transmission over the internet is 100% secure, and
                we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                We retain your account data for as long as your account is active. If you delete your account,
                your personal information is removed within 30 days, except where we are legally required to
                retain it longer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of promotional communications</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                To exercise any of these rights, email us at{" "}
                <a href={`mailto:${config.contact.email}`} className="text-brand-green hover:underline">
                  {config.contact.email}
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our services are not directed at children under 13. We do not knowingly collect personal
                information from children. If you believe a child has provided us information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">10. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about this Privacy Policy, contact us at:
              </p>
              <div className="mt-3 bg-brand-green-soft rounded-xl p-4 text-sm text-slate-700 space-y-1">
                <p className="font-semibold">{config.appName}</p>
                <p>{config.contact.location}</p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${config.contact.email}`} className="text-brand-green hover:underline">
                    {config.contact.email}
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a href={`tel:+91${config.contact.whatsapp?.slice(2)}`} className="text-brand-green hover:underline">
                    {config.contact.phone}
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
