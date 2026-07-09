import type { Metadata, Viewport } from "next";
import { Jua, Gowun_Dodum } from "next/font/google";
import "./globals.css";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
});

const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gowun-dodum",
});

export const metadata: Metadata = {
  title: "레시피북",
  description: "나만의 레시피 기록장",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowunDodum.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col bg-cream text-brown-text">
        {children}
      </body>
    </html>
  );
}
