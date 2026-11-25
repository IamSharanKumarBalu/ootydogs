import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog & Pet Breeds Directory",
  description:
    "Explore dog breeds, cat breeds and other pet types available in Ooty. Browse breed guides and find pets near you.",
  openGraph: {
    title: "Dog & Pet Breeds Directory | OotyDogs",
    description: "Browse all dog and cat breeds available in Ooty and the Nilgiris.",
  },
};

export default function BreedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
