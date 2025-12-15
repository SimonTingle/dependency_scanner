import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DepTrawl Intelligence",
  description: "Advanced Dependency Scanner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
