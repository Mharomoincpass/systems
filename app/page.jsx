import FrsionLanding from "@/components/FrsionLanding";

export const metadata = {
  title: "MHAROMO Systems — Software & web development",
  description:
    "MHAROMO Systems designs and builds custom software, modern websites, and product platforms. Clear scope, direct delivery, full ownership.",
  openGraph: {
    title: "MHAROMO Systems — Software & web development",
    description:
      "Custom software, web development, and product systems — built to ship.",
    url: "/",
    images: [{ url: "/brand/logo-full.png" }],
  },
};

export default function HomePage() {
  return <FrsionLanding />;
}
