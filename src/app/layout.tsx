// [Owner: D] Root layout — wraps every route in the shared BottomNav.
import type { Metadata } from "next";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniMatch",
  description: "Find and connect with classmates at USYD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-16">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
