import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getRequestLocale } from "@/lib/i18n-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ideator",
  description: "Democratic Prioritization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localePromise = getRequestLocale();
  return (
    <html lang="" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleWrapper localePromise={localePromise}>{children}</LocaleWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Server component to await locale and set lang attribute correctly
async function LocaleWrapper({ children, localePromise }: { children: React.ReactNode; localePromise: Promise<string> }) {
  const locale = await localePromise;
  return <div lang={locale}>{children}</div>;
}
