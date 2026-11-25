import { config } from "@/constants/config";

export default function BuyerProtection() {
    return (
        <div className="min-h-screen bg-brand-green-soft py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Buyer Protection Policy</h1>
                    <p className="text-sm text-slate-500 mb-8">Last updated: November 22, 2025</p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. About This Policy</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                {config.appName} is a listing platform that connects pet owners and breeders with prospective buyers and adopters.
                                We do not sell pets directly. All transactions and handovers occur between the lister and the buyer.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Because pets are living beings, there are no &quot;returns&quot; in the traditional sense. Instead, this policy describes
                                how we handle disputes, misrepresented listings, and what buyers should do if something goes wrong.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Before You Enquire</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                We strongly recommend taking the following steps before agreeing to adopt or purchase a pet:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Ask for recent photos and a short video of the pet</li>
                                <li>Request vaccination and health certificates from the lister</li>
                                <li>Arrange a video call or in-person meeting before committing</li>
                                <li>Verify the lister&apos;s contact details and location match the listing</li>
                                <li>Never transfer payment before meeting or verifying the pet in person</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Reporting a Misleading Listing</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If you believe a listing is fraudulent, misrepresented, or in violation of our policies, please report it immediately.
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Use the &quot;Report&quot; link on the listing page</li>
                                <li>Or email us at {config.contact.email} with the listing link and your concern</li>
                                <li>Include any evidence (messages, photos, receipts) to help our review</li>
                            </ul>
                            <p className="text-slate-600 leading-relaxed">
                                Our team reviews all reports within 48 hours. Listings found to be fraudulent or in violation of our standards
                                are removed and the account may be suspended.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Dispute Resolution</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                If a dispute arises between a buyer and a lister after the handover, we encourage both parties to resolve it
                                amicably. {config.appName} can facilitate communication but is not liable for the outcome of private transactions
                                between buyers and listers.
                            </p>
                            <div className="bg-brand-green-soft border-l-4 border-brand-green p-4 rounded-r-xl">
                                <p className="text-slate-700 font-medium mb-1">Platform Role</p>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {config.appName} is a listing marketplace. We connect people, but we are not a party to any transaction
                                    between a buyer and a lister. We cannot compel refunds or force listers to take pets back.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Health Concerns After Handover</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If your new pet shows signs of illness shortly after handover:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Consult a veterinarian immediately</li>
                                <li>Notify the lister — a responsible lister will want to know and assist</li>
                                <li>Keep all veterinary records and receipts as evidence</li>
                                <li>Report the listing to us if the lister misrepresented the pet&apos;s health</li>
                            </ul>
                            <p className="text-slate-600 leading-relaxed">
                                We take health misrepresentation very seriously. Listers who repeatedly post pets with undisclosed health
                                conditions will be removed from the platform.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Contact Us</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                For any buyer protection concerns, please reach out to us:
                            </p>
                            <div className="bg-slate-50 p-6 rounded-xl border border-green-100">
                                <p className="text-slate-700 font-medium mb-3">{config.appName} — Support Team</p>
                                <p className="text-slate-600 text-sm"><strong>Email:</strong> {config.contact.email}</p>
                                <p className="text-slate-600 text-sm mt-1"><strong>Phone:</strong> {config.contact.phone}</p>
                                <p className="text-slate-600 text-sm mt-1"><strong>Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
