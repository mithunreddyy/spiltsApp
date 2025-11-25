import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export const metadata: Metadata = {
  title: "Money Splits - Track Expenses with Friends",
  description:
    "Track shared expenses and splits among friends with an elegant glass morphism interface",
  keywords: [
    "expense tracker",
    "split bills",
    "money management",
    "group expenses",
    "glass morphism",
  ],
  authors: [{ name: "Money Splits Team" }],
  openGraph: {
    title: "Money Splits - Beautiful Expense Tracking",
    description:
      "Track shared expenses with friends using our stunning glass morphism interface",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#111827"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
