import FrsionLanding from "@/components/FrsionLanding";

export const metadata = {
  title: "FrsionOS — Pollinations image studio",
  description:
    "Minimal AI image studio for prompts, engines, and gallery — powered by Pollinations.ai on mharomo.systems.",
  openGraph: {
    title: "FrsionOS — Pollinations image studio",
    description:
      "Generate images with FLUX, DreamShaper, and more. Transparent Pollen pricing and a 24-hour server gallery.",
    url: "/",
  },
};

export default function HomePage() {
  return <FrsionLanding />;
}
