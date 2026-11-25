import { config } from "@/constants/config";

export default function PetHandoverGuidelines() {
    return (
        <div className="min-h-screen bg-brand-green-soft py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Pet Handover Guidelines</h1>
                    <p className="text-sm text-slate-500 mb-8">Last updated: November 22, 2025</p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. About Pet Handover</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                {config.appName} is a listing platform. We do not ship or transport pets. All handovers are arranged
                                directly between the lister and the buyer at a mutually agreed time and place.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                These guidelines are provided to help ensure that every handover is safe, humane, and stress-free for the pet.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Arranging the Handover</h2>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">2.1 Choose a Safe Meeting Place</h3>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Meet in a public, well-lit location such as a veterinary clinic or pet-friendly café</li>
                                <li>Avoid exchanging pets at night or in isolated locations</li>
                                <li>If meeting at the lister&apos;s home, let someone know where you are going</li>
                            </ul>

                            <h3 className="text-xl font-medium text-slate-700 mb-3 mt-6">2.2 What to Bring</h3>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>A pet carrier or box suitable for the animal&apos;s size</li>
                                <li>A towel or blanket with the mother&apos;s or current home&apos;s scent to comfort the pet</li>
                                <li>Water and a small amount of familiar food for the journey</li>
                                <li>Your ID and any agreed payment method</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Documents to Collect</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                Always collect the following from the lister at handover:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Vaccination certificate (if applicable) with the vet&apos;s name and stamp</li>
                                <li>Deworming and health treatment records</li>
                                <li>Pedigree or registration papers (for pedigree breeds)</li>
                                <li>Diet and feeding schedule that the pet is currently on</li>
                                <li>Any veterinary prescriptions or ongoing medication details</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. At the Time of Handover</h2>
                            <div className="bg-brand-green-soft border-l-4 border-brand-green p-6 mb-4 rounded-r-xl">
                                <p className="text-slate-700 font-medium mb-2">Inspect Before Accepting</p>
                                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                    <li>Observe the pet&apos;s behaviour — alert, curious and friendly is a good sign</li>
                                    <li>Check for visible signs of illness: runny eyes, lethargy, laboured breathing</li>
                                    <li>Verify the pet matches the listing photos in breed, colour and approximate age</li>
                                    <li>Ask the lister any questions you still have before completing payment</li>
                                </ul>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                Once you accept the pet and complete the transaction, the responsibility for the animal&apos;s care transfers to you.
                                If you have any concerns at the point of handover, raise them with the lister immediately.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Transporting Your New Pet</h2>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-4">
                                <li>Keep the pet in a secure, ventilated carrier throughout the journey</li>
                                <li>Do not leave the pet unattended in a vehicle, especially in warm weather</li>
                                <li>Keep the journey as short and calm as possible to reduce stress</li>
                                <li>Avoid loud music or sudden braking</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. First Veterinary Visit</h2>
                            <p className="text-slate-600 leading-relaxed mb-3">
                                We strongly recommend booking a vet check-up within 48–72 hours of bringing a new pet home:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                                <li>Confirm the pet&apos;s health status and vaccination needs</li>
                                <li>Establish a baseline health record with your chosen vet</li>
                                <li>Ask about appropriate diet, deworming schedule, and any breed-specific care</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Issues After Handover</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If you believe the pet was misrepresented in the listing, please contact us. See our{" "}
                                <a href="/legal/returns" className="text-brand-green underline hover:text-brand-green-mid transition-colors">
                                    Buyer Protection Policy
                                </a>{" "}
                                for details on reporting and disputes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Contact Us</h2>
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
