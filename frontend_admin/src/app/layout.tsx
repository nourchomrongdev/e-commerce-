import type { Metadata } from "next";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | KhmerDigital",
    default: "KhmerDigital Admin",
  },
  description: "Admin dashboard for managing products, customers, orders, and platform performance.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        {children}
      </body>
    </html>
  );
}
