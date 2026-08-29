// [Owner: D] Root layout — wraps every route in the shared TopNav.
import type { Metadata } from "next";
import { TopNav } from "@/components/ui/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniSoul",
  description: "Find and connect with classmates at USYD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
