import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Care Blog & Guides",
  description:
    "Expert pet care tips, breed guides, training advice and adoption stories for dog and cat owners in Ooty and India.",
  openGraph: {
    title: "Pet Care Blog | OotyDogs",
    description: "Read expert pet care tips, breed guides and training advice on OotyDogs.",
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
