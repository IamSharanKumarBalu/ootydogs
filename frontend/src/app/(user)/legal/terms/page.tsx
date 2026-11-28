import { config } from "@/constants/config";

export const metadata = {
  title: "Terms & Conditions | OotyDogs",
  description: "Terms and conditions for using the OotyDogs pet listing platform.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-brand-green-soft py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: November 28, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Welcome to {config.appName}. By accessing or using our website (ootydogs.com) you agree to be
                bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.
              </p>
              <p className="text-slate-600 leading-relaxed">
                These terms apply to all visitors, registered users, listers, and anyone who accesses our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. About the Platform</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                {config.appName} is a classified listing marketplace based in {config.contact.location}. We connect
                pet owners, breeders, and service providers with prospective buyers and adopters. We do not own,
                sell, breed, transport, or take custody of any animals or products.
              </p>
              <p className="text-slate-600 leading-relaxed">
                All listings are created by independent users. {config.appName} reviews listings for policy
                compliance but cannot independently verify every claim. Users must exercise their own due diligence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Accounts and Registration</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>You must provide accurate and complete information when registering</li>
                <li>You are responsible for maintaining the security of your password</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person may not maintain multiple accounts</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Listing Rules</h2>
              <p className="text-slate-600 leading-relaxed mb-3">When you post a listing you agree that:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>All information, photos, and details are accurate and truthful</li>
                <li>Photos are of the actual pet, product, or service being listed</li>
                <li>You have the legal right to sell, rehome, or offer the listed item/pet</li>
                <li>No endangered, protected, or illegally owned animals will be listed</li>
                <li>No stolen goods, counterfeit products, or illegal services will be listed</li>
                <li>Contact details provided are valid and belong to you</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                Listings found to violate these rules will be removed without notice and no refund will be issued.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Subscription Plans</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                {config.appName} offers paid subscription plans (Basic, Standard, Premium) that allow you to post
                pet listings, services, and products. By purchasing a subscription you agree that:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>Payments are processed securely by Razorpay</li>
                <li>Subscription fees are non-refundable except as described in our Returns &amp; Refunds Policy</li>
                <li>Your listing quota is shared across pet listings, services, and products</li>
                <li>Listings that violate our policies may be removed without a refund</li>
                <li>Unused slots do not carry over to the next billing period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Prohibited Activities</h2>
              <p className="text-slate-600 leading-relaxed mb-3">You must not:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>Post false, misleading, or fraudulent listings</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Scrape, crawl, or bulk-download content from our platform</li>
                <li>Attempt to gain unauthorised access to our systems</li>
                <li>Use our platform to spam or send unsolicited messages</li>
                <li>List any animal captured from the wild</li>
                <li>Violate any applicable Indian law or regulation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed">
                All content on {config.appName} — including logos, design, text, and code — is owned by or
                licensed to us. You retain ownership of photos and descriptions you post, but grant us a
                non-exclusive licence to display and distribute that content on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                {config.appName} is a listing platform only. We are not a party to any transaction between users.
                To the maximum extent permitted by law, we are not liable for:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>The health, condition, or welfare of any pet listed on our platform</li>
                <li>Any disputes between buyers and sellers</li>
                <li>Any loss, damage, or injury arising from the use of our platform</li>
                <li>Inaccurate information in user-created listings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive
                jurisdiction of the courts in Nilgiris district, Tamil Nadu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">10. Changes to These Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update these Terms from time to time. Continued use of the platform after changes
                constitutes acceptance of the revised terms. We will note the &quot;Last updated&quot; date at the top
                of this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">11. Contact Us</h2>
              <div className="bg-brand-green-soft rounded-xl p-4 text-sm text-slate-700 space-y-1">
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
                  <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`} className="text-brand-green hover:underline">
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
