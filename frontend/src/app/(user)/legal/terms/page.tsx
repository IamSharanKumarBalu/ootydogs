import { config } from "@/constants/config";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-brand-green-soft py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms and Conditions</h1>
                    <p className="text-sm text-slate-500 mb-8">Last updated: November 22, 2025</p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Agreement to Terms</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Welcome to {config.appName}. By accessing and using our website, you accept and agree to be bound by these
                                Terms and Conditions. If you do not agree to these terms, please do not use our website or services.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                These terms apply to all visitors, users, listers, and browsers who access or use our pet listing platform.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. About the Platform</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                {config.appName} is a listing marketplace that connects pet owners, breeders, and rescue organisations with
                                prospective buyers and adopters. We do not own, sell, or transport any pets ourselves.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                All pet listings are created by independent listers. {config.appName} reviews listings for policy compliance
                                but cannot independently verify every claim made in a listing. Buyers are encouraged to exercise their own
                                due diligence before completing any transaction.
                            </p>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">2.1 Listing Accuracy</h3>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Listers must provide accurate descriptions, photos, and health information for every pet</li>
                                <li>Photos must be of the actual pet being listed, not stock images</li>
                                <li>Breed, age, vaccination status, and price must be truthful</li>
                                <li>Listings found to be misleading will be removed without notice</li>
                            </ul>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">2.2 Listing Availability</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Listings are subject to availability. Listers are responsible for marking a pet as rehomed or sold
                                promptly to avoid misleading enquiries.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Pricing and Transactions</h2>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">3.1 Pricing</h3>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>All prices are listed in Indian Rupees (₹) unless otherwise stated</li>
                                <li>Prices are set by the lister and are subject to change</li>
                                <li>Adoption listings may be listed as free or with a nominal rehoming fee</li>
                            </ul>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">3.2 Transactions</h3>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                All transactions are conducted directly between the buyer and the lister. {config.appName} does not
                                process payments and is not a party to any transaction. We recommend:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Meeting in person before transferring any payment</li>
                                <li>Using traceable payment methods (UPI, bank transfer)</li>
                                <li>Never paying in full before seeing the pet</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Enquiries</h2>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Enquiries sent through the platform are forwarded to the lister</li>
                                <li>Response times are at the lister&apos;s discretion</li>
                                <li>Do not use the enquiry system to send spam or inappropriate messages</li>
                                <li>Listers reserve the right to decline any enquiry without explanation</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Pet Handover</h2>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Handover times and locations are agreed between buyer and lister</li>
                                <li>Buyers should inspect the pet at the time of handover before completing payment</li>
                                <li>See our <a href="/legal/shipping" className="text-brand-green underline hover:text-brand-green-mid">Pet Handover Guidelines</a> for detailed advice</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Animal Welfare</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                All users of {config.appName} agree to uphold basic animal welfare standards:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Pets must not be listed for use in fighting, testing, or any harmful activity</li>
                                <li>Pets must be old enough to be separated from their mother (typically 6–8 weeks minimum)</li>
                                <li>Listers must not misrepresent the age, health, or breed of a pet</li>
                                <li>Breeding-related listings must comply with applicable Indian animal welfare laws</li>
                            </ul>
                            <p className="text-slate-600 leading-relaxed">
                                Listings that violate animal welfare standards will be removed immediately and the account suspended.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Prohibited Listings</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                The following are not permitted on {config.appName}:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Wild animals, exotic species, or endangered animals protected under Indian law</li>
                                <li>Pets listed for resale at inflated prices without genuine ownership</li>
                                <li>Duplicate or fictitious listings designed to generate fraudulent enquiries</li>
                                <li>Any listing that violates the Prevention of Cruelty to Animals Act, 1960</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. User Accounts</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                When you create an account with us:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>You must provide accurate and complete information</li>
                                <li>You are responsible for maintaining account security</li>
                                <li>You must not share your account credentials</li>
                                <li>You are responsible for all activities under your account</li>
                                <li>We reserve the right to suspend or terminate accounts for violations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Listers</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If you create a listing on {config.appName}, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Provide accurate and truthful information about the pet</li>
                                <li>List only pets you own or have the authority to rehome</li>
                                <li>Respond to enquiries in good faith</li>
                                <li>Comply with all applicable platform approval processes</li>
                                <li>Remove or update the listing when the pet has been rehomed</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">10. Intellectual Property</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                All content on this website, including images, text, logos, and designs, is the property of {config.appName}
                                or is used with permission, and is protected by copyright and trademark laws.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                You may not reproduce, distribute, or use any content without written permission.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">11. Limitation of Liability</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                To the maximum extent permitted by law:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>We are not liable for the accuracy of any pet listing created by a third-party lister</li>
                                <li>We are not liable for the outcome of any transaction between a buyer and a lister</li>
                                <li>We are not responsible for any animal welfare issues arising after handover</li>
                                <li>We are not liable for indirect, incidental, or consequential damages</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">12. Governing Law</h2>
                            <p className="text-slate-600 leading-relaxed">
                                These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the
                                exclusive jurisdiction of the applicable courts in India.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">13. Changes to Terms</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                                Your continued use of the website constitutes acceptance of the modified terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">14. Contact Information</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                For questions about these Terms and Conditions, please contact us:
                            </p>
                            <div className="bg-slate-50 p-6 rounded-xl border border-green-100">
                                <p className="text-slate-700 font-medium mb-3">{config.appName}</p>
                                <p className="text-slate-600 text-sm"><strong>Email:</strong> {config.contact.email}</p>
                                <p className="text-slate-600 text-sm mt-1"><strong>Phone:</strong> {config.contact.phone}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
