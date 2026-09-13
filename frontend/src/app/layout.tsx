import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    template: '%s | KhmerDigital',
    default: 'KhmerDigital',
  },
  description: "Discover apps and digital products from independent creators.",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <body
        className={`${roboto.variable} m-0 flex min-h-screen flex-col bg-background text-[#121326] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        style={{ fontFamily: "var(--font-roboto)" }}
      >
        <RouteLoadingBar />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
