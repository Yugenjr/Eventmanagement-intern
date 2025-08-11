import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { DemoNotice } from "@/components/demo-notice";
import { FirebaseSetupCheck } from "@/components/firebase-setup-check";
import ErrorBoundary from "@/components/error-boundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EventConnect - Modern Event Management",
  description: "Create, discover, and manage events with real-time updates and seamless user experience.",
  keywords: ["events", "management", "real-time", "innovaid", "nextjs"],
  authors: [{ name: "EventConnect Team" }],
  creator: "EventConnect",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eventconnect.vercel.app",
    title: "EventConnect - Modern Event Management",
    description: "Create, discover, and manage events with real-time updates and seamless user experience.",
    siteName: "EventConnect",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventConnect - Modern Event Management",
    description: "Create, discover, and manage events with real-time updates and seamless user experience.",
    creator: "@eventconnect",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-4">
                  <DemoNotice />
                  <FirebaseSetupCheck />
                </div>
                <main>{children}</main>
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
