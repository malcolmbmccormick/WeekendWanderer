import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeekendWanderer",
  description:
    "AI-powered weekend trip planning for foreigners living in Europe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
