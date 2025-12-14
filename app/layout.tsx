import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicLayoutCheck from "@/components/layout/PublicLayoutCheck";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lindsay Precast - Renewable Energy Infrastructure",
  description: "Expert precast concrete solutions for renewable energy projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PublicLayoutCheck>{children}</PublicLayoutCheck>
      </body>
    </html>
  );
}
