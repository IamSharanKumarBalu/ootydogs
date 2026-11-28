import { config } from "@/constants/config";

export const metadata = {
  title: "Returns & Refunds | OotyDogs",
  description: "OotyDogs refund policy for subscription plans.",
};

export default function ReturnsAndRefunds() {
  return (
    <div className="min-h-screen bg-brand-green-soft py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Returns &amp; Refunds</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: November 28, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. About This Policy</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                {config.appName} is a classified listing platform — we do not sell pets, products, or services
                directly. This policy covers refunds on <strong>subscription plan payments</strong> only.
              </p>
              <p className="text-slate-600 leading-relaxed">
                All payments are processed securely by Razorpay. Subscription fees are generally non-refundable
                except in the specific circumstances described below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. When a Refund is Issued</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                A refund will be automatically initiated in the following case:
              </p>
              <div className="bg-brand-green-soft border border-brand-green/20 rounded-xl p-5">
                <p className="text-slate-700 font-semibold mb-1">Basic Plan — Listing Rejected</p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If you are on the Basic plan (single-listing) and your only listing is rejected by our
                  moderation team, a full refund of your subscription fee will be automatically processed
                  to your original payment method within 5–7 working days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. When a Refund is Not Issued</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>Subscription fees for Standard and Premium plans are non-refundable</li>
                <li>No refund is issued if a listing is removed for violating our listing rules</li>
                <li>No refund is issued for unused listing slots within a subscription period</li>
                <li>No refund is issued if you choose to delete your listing or account voluntarily</li>
                <li>Payment failures or duplicate charges — please contact us immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. No Returns on Pets or Products</h2>
              <p className="text-slate-600 leading-relaxed">
                {config.appName} is a listing platform. We are not a party to any transaction between a buyer and
                a seller. Any arrangement for returning a pet or a product is entirely between the buyer and the
                seller. We strongly recommend buyers verify all details in person before completing a transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Duplicate or Failed Payments</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have been charged more than once or experienced a payment failure that resulted in
                a deduction, contact us at{" "}
                <a href={`mailto:${config.contact.email}`} className="text-brand-green hover:underline">
                  {config.contact.email}
                </a>{" "}
                within 7 days with your Razorpay payment ID. We will investigate and issue a refund if confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. How to Request a Refund</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                For any refund request, email us at{" "}
                <a href={`mailto:${config.contact.email}`} className="text-brand-green hover:underline">
                  {config.contact.email}
                </a>{" "}
                with:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-4">
                <li>Your registered email address</li>
                <li>Razorpay payment ID or order ID</li>
                <li>Reason for the refund request</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                We aim to respond to all refund requests within 2 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Refund Timeline</h2>
              <p className="text-slate-600 leading-relaxed">
                Once a refund is approved, it typically takes 5–7 working days for the amount to reflect in your
                bank account or card statement, depending on your payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Contact Us</h2>
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
