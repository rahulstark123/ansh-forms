import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { buildSiteMetadata } from "@/lib/seo";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = buildSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${mono.variable} h-full`}>
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
