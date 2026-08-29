// [Owner: D] Root layout — wraps every route in the shared TopNav.
import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { TopNav } from "@/components/ui/TopNav";
import "./globals.css";

// Bold rounded-geometric display font for headings, paired with a plainer
// sans for UI text/body — deliberately not the default-everywhere Inter,
// which is what makes most AI-tool UIs look the same.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
// Nav tab labels. Was Orbitron (a literal match for the sci-fi reference),
// but at 18px in a real UI its wide, closed letterforms read as costume
// rather than as interface. Space Grotesk keeps the geometric/technical
// feel with proper text proportions, and stays crisp set in caps with wide
// tracking — which is where the "tech" character actually comes from here.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-tech",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniSoul",
  description: "Find and connect with classmates at USYD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
