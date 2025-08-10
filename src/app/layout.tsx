import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EventConnect - Modern Event Management",
  description: "Create, discover, and manage events with real-time updates and seamless user experience.",
  keywords: ["events", "management", "real-time", "firebase", "nextjs"],
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
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Header />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
