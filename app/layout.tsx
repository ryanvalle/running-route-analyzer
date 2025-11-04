import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Running Route Analyzer",
  description: "Analyze your running routes from Strava activities or FIT files with detailed elevation and terrain breakdowns",
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
