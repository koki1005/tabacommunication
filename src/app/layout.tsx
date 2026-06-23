import type { Metadata, Viewport } from "next";
import { Yuji_Syuku } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Ticker } from "@/components/Ticker";

const brush = Yuji_Syuku({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-brush",
});

export const metadata: Metadata = {
  title: "たばこみゅにけーしょん — 酒とタバコの教科書 × 掲示板",
  description:
    "一人暮らし大学生のための酒・タバコの教科書 × 掲示板。事実の幹に、生の偏見が枝として伸びる場所。",
};

export const viewport: Viewport = {
  themeColor: "#02000f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={brush.variable}>
      <body className="has-ticker">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-3 pb-12 pt-4 sm:px-4 sm:pt-6 md:px-6">
          {children}
        </main>
        <Ticker />
      </body>
    </html>
  );
}
