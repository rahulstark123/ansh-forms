import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANSH Forms - High Performance Forms & AI Landing Page Builder",
  description: "Create forms, publish beautiful landing pages, generate schemas using AI, share QR codes, and analyze submissions inside a premium workflow manager.",
  keywords: ["ANSH Forms", "Form Builder", "Landing Page Builder", "AI Form Generator", "QR Forms", "Response Analytics"],
  icons: {
    icon: "/anshFavicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="h-full flex flex-col font-sans select-none antialiased bg-background text-foreground">
        <AppProviders>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
