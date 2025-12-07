import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Antique_Soft } from "next/font/google";
import "./globals.css";
import { ClientComponents } from "@/components/ui/ClientWrapper";

// 明朝体：しっぽり明朝（本文・UI全般に使用）
const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// タイトル用：Zen Antique Soft（力強くダイナミック）
const zenAntique = Zen_Antique_Soft({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "虚ろの子 | 空白に刻まれし理",
  description: "「空白の命刻」を持つ主人公・刻夜が、すべてを奪われた絶望から覚醒し、歪んだ世界の理を書き換えていく物語。",
  keywords: ["小説", "ファンタジー", "陰陽五行", "web小説"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${shippori.variable} ${zenAntique.variable} antialiased`}>
        <ClientComponents>
          {children}
        </ClientComponents>
        {/* 和紙テクスチャのノイズオーバーレイ */}
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
