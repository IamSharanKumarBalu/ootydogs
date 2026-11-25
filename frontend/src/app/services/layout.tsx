import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Services in Ooty",
  description:
    "Find veterinary clinics, pet groomers, boarding kennels, trainers and more pet services in Ooty and the Nilgiris.",
  openGraph: {
    title: "Pet Services in Ooty | OotyDogs",
    description: "Discover vetinary, grooming, boarding and other pet services near Ooty.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
