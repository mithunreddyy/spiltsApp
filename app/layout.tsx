import type { Metadata, Viewport } from "next";
import "./globals.css";

export const generateViewport: Viewport = {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      themeColor: '#FFFFFF', // Example themeColor
    };


export const metadata: Metadata = {
  title: "Money Splits - Track Expenses with Friends",
  description:
    "Track shared expenses and splits among friends with an easy-to-use, beautiful interface",
  keywords: [
    "expense tracker",
    "split bills",
    "money management",
    "group expenses",
  ],
  authors: [{ name: "Money Splits Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
