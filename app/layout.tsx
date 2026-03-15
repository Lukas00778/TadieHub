import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradieHub - Connect with Trusted Tradies",
  description: "Find reliable gardeners, tradies and service providers across Australia",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}