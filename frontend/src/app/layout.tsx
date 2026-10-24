import type { Metadata } from "next";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import CookieConsent from "@/components/CookieConsent";
import AccountRestrictionMonitor from "@/components/AccountRestrictionMonitor";
import "./globals.css";

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <body
        className="m-0 flex min-h-screen flex-col bg-background text-[#121326] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <RouteLoadingBar />
        <AccountRestrictionMonitor />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
