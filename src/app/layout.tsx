import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { PWARegister } from "@/components/common/pwa-register";
import { ChatBot } from "@/components/common/chatbot";
import { SideChatWidget } from "@/components/common/side-chat-widget";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "UniGame - Premium Gaming Hub",
  description: "Play your favorite games at UniGame. The premier destination for competitive strategy, global standings, and friendly multiplayer rooms.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UniGame",
  },
  openGraph: {
    title: "UniGame - Premium Gaming Hub",
    description: "Play your favorite games at UniGame. The premier destination for competitive strategy and live rooms.",
    url: "https://unigame.gg",
    siteName: "UniGame",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UniGame Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniGame - Premium Gaming Hub",
    description: "The global platform for competitive gaming and strategic matchups.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://unigame.gg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6b00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-slate-950 text-white selection:bg-brand-amber selection:text-slate-950"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
              <ChatBot />
              <SideChatWidget />
              <PWARegister />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
