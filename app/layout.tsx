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

const TITLE = "송구르르 레시피북";
const DESCRIPTION = "나만의 레시피 기록장";

export const metadata: Metadata = {
  metadataBase: new URL("https://bakersong.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  appleWebApp: {
    title: TITLE,
    statusBarStyle: "default",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: TITLE,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF6F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowunDodum.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col bg-cream text-brown-text">
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1274812993387845"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
