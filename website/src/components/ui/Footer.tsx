"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const elements = [
  { name: "木", color: "var(--wood)" },
  { name: "火", color: "var(--fire)" },
  { name: "土", color: "var(--earth)" },
  { name: "金", color: "var(--metal)" },
  { name: "水", color: "var(--water)" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-yang/10 bg-yin">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 太極図 */}
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 100 100" className="w-12 h-12 opacity-30">
            {/* 背景円（黒） */}
            <circle cx="50" cy="50" r="48" fill="var(--yin)" />
            {/* 陽（白）半円：右半分 + S字カーブ */}
            <path
              d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
              fill="var(--yang)"
            />
            {/* 外円（装飾） */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--yang)" strokeWidth="1" />
            {/* 陰中の陽（上の黒い部分の中の白丸） */}
            <circle cx="50" cy="26" r="5" fill="var(--yang)" />
            {/* 陽中の陰（下の白い部分の中の黒丸） */}
            <circle cx="50" cy="74" r="5" fill="var(--yin)" />
          </svg>
        </div>

        {/* 五行の円環 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {elements.map((el, index) => (
            <div key={el.name} className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: el.color }}
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.2 }}
              />
              {index < elements.length - 1 && (
                <div className="w-6 h-px bg-yang/20" />
              )}
            </div>
          ))}
        </div>

        {/* ナビリンク */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <Link
            href="/"
            className="text-muted hover:text-yang transition-colors duration-300"
          >
            トップ
          </Link>
          <Link
            href="/story"
            className="text-muted hover:text-yang transition-colors duration-300"
          >
            世界観
          </Link>
          <Link
            href="/characters"
            className="text-muted hover:text-yang transition-colors duration-300"
          >
            登場人物
          </Link>
          <Link
            href="/read"
            className="text-muted hover:text-yang transition-colors duration-300"
          >
            本編を読む
          </Link>
        </div>

        {/* 区切り線 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-yang/20" />
          <div className="w-1 h-1 bg-earth rotate-45" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-yang/20" />
        </div>

        {/* コピーライト */}
        <p className="text-center text-muted/50 text-xs tracking-widest">
          © 2024 虚ろの子
        </p>
      </div>

      {/* 背景グラデーション */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-earth/5 to-transparent blur-[100px]" />
      </div>
    </footer>
  );
}
