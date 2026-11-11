import { Geist, Syne, Manrope } from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});
