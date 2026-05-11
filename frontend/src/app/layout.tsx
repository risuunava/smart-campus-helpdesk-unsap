import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Campus Helpdesk - UNSAP",
  description:
    "Sistem pelaporan keluhan mahasiswa Universitas Sebelas April dengan kecerdasan buatan",
  keywords: "UNSAP, helpdesk, pelaporan, mahasiswa, kampus, AI",
  authors: [{ name: "UNSAP IT Team" }],
  openGraph: {
    title: "Smart Campus Helpdesk - UNSAP",
    description: "Laporkan keluhan Anda dengan mudah dan cepat",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}