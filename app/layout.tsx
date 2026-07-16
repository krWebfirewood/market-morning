import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://market-morning.vercel.app"),
  title: "Market Morning | 출근길 시장 브리핑",
  description: "국내 증시 개장 전 주요 시장 지표와 경제 일정, 관심 종목 공시를 확인하는 출근길 시장 브리핑입니다.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
  { media: "(prefers-color-scheme: dark)", color: "#0d1110" },
] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('market-morning-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}})()` }} /></head><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
