import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Pets for Adoption",
  description:
    "Find dogs, cats, birds and other pets for adoption or sale in Ooty and the Nilgiris. Filter by breed, pet type, location and more.",
  openGraph: {
    title: "Browse Pets for Adoption | OotyDogs",
    description: "Find your perfect pet companion in Ooty. Dogs, cats, birds and more.",
  },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
