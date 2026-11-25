import { Metadata } from "next";
import Link from "next/link";
import { FaPaw } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Animal Welfare Policy | OotyDogs",
  description: "OotyDogs is committed to responsible pet ownership and the welfare of all animals listed on our platform.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-slate-800 mb-3">{title}</h2>
    <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function AnimalWelfarePage() {
  return (
    <div className="min-h-screen bg-brand-green-soft py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-green-soft border-2 border-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPaw className="text-brand-green w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Animal Welfare Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: November 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8">

          <p className="text-slate-600 leading-relaxed mb-8">
            OotyDogs is a platform for connecting pet owners and breeders with families looking for animal companions. We
            take animal welfare seriously and are committed to ensuring that every pet listed or rehomed through our
            platform receives the care, respect and love it deserves.
          </p>

          <Section title="1. Our Commitment to Animal Welfare">
            <p>
              We believe every animal has inherent value and deserves to live in a safe, caring environment. Our platform
              does not support or facilitate the sale of animals for harmful, exploitative or illegal purposes.
            </p>
            <p>
              We actively encourage responsible pet ownership, ethical breeding practices and adoption over purchasing
              where possible.
            </p>
          </Section>

          <Section title="2. Listing Standards">
            <p>All listings on OotyDogs must comply with the following standards:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Animals must be in good health and appropriate age for rehoming (minimum 8 weeks for puppies and kittens).</li>
              <li>Listings must accurately represent the animal's breed, age, health status and vaccination record.</li>
              <li>Sellers must disclose known health conditions or behavioural traits that could affect the buyer's decision.</li>
              <li>Breeding animals must not be overworked; females must be allowed adequate recovery time between litters.</li>
              <li>Pricing must reflect the genuine cost of care — animals must not be sold in distressed or emergency conditions solely for financial gain.</li>
            </ul>
          </Section>

          <Section title="3. Prohibited Activities">
            <p>The following are strictly prohibited on OotyDogs:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Listing animals for use in fighting, baiting or any form of abuse.</li>
              <li>Selling puppies or kittens under 8 weeks of age.</li>
              <li>Misrepresenting an animal's breed, age, health or vaccination status.</li>
              <li>Listing wild, exotic or endangered species without proper legal documentation.</li>
              <li>Abandonment, neglect or any form of cruelty towards listed animals.</li>
              <li>Using the platform for puppy mill operations or mass commercial breeding without adequate welfare standards.</li>
            </ul>
          </Section>

          <Section title="4. Responsible Adoption & Sale">
            <p>
              We strongly encourage sellers and breeders to screen potential buyers to ensure animals go to loving,
              responsible homes. This may include asking about living conditions, prior pet ownership experience, and
              the buyer's commitment to long-term care.
            </p>
            <p>
              Buyers are encouraged to ask for vaccination records, health certificates and a meet-and-greet with the
              animal before completing any transaction.
            </p>
          </Section>

          <Section title="5. Reporting Welfare Concerns">
            <p>
              If you encounter a listing that you believe violates animal welfare standards, or if you suspect abuse,
              neglect or misrepresentation, please report it immediately using the report feature on the listing page or
              by contacting us directly.
            </p>
            <p>
              Verified reports of animal abuse will be forwarded to the relevant animal welfare authorities and law
              enforcement as required under the Prevention of Cruelty to Animals Act, 1960 (India).
            </p>
          </Section>

          <Section title="6. Compliance with Indian Law">
            <p>
              All users of OotyDogs must comply with applicable Indian laws relating to animals, including but not
              limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Prevention of Cruelty to Animals Act, 1960</li>
              <li>Wildlife Protection Act, 1972 (for exotic species)</li>
              <li>State-specific animal welfare regulations</li>
            </ul>
            <p>
              OotyDogs reserves the right to remove listings and ban users who violate these laws or our welfare policy.
            </p>
          </Section>

          <Section title="7. Contact Us">
            <p>
              If you have questions about our animal welfare policy or wish to report a concern, please{" "}
              <Link href="/contact" className="text-brand-green hover:text-brand-green-mid font-medium underline underline-offset-2">
                contact us
              </Link>
              . We are committed to responding to all welfare-related reports within 24 hours.
            </p>
          </Section>

        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-brand-green hover:text-brand-green-mid font-medium transition-colors">
            ← Back to OotyDogs
          </Link>
        </div>
      </div>
    </div>
  );
}
