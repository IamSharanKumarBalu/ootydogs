import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with OotyDogs. Reach us by phone, WhatsApp or email for any queries about pet listings and services in Ooty.",
  openGraph: {
    title: "Contact OotyDogs",
    description: "Reach out to OotyDogs for support, listings queries or general enquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
