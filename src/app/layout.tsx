// [Owner: D] Root layout — wraps every route in the shared TopNav.
import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "UniMatch",
  description: "Find and connect with classmates at USYD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jakarta.variable}`}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
