import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OneSpace | CS Coworking",
  description: "Operations platform for CS Coworking Spaces",
};

import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";
import { AppDataProvider } from "@/lib/store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased min-h-screen bg-cs-gray-50`}>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" />
        </AppDataProvider>
      </body>
    </html>
  );
}
