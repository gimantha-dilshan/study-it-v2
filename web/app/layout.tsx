import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ScrollRestoration from "../components/ScrollRestoration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Study-It | Elevate Your Learning",
  description: "Register your WhatsApp account to unlock premium features and higher daily limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
