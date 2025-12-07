"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
  { label: "世界観", href: "/story", color: "var(--wood)" },
  { label: "人物", href: "/characters", color: "var(--fire)" },
  { label: "読む", href: "/read", color: "var(--earth)" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-yin/80 backdrop-blur-md border-b border-yang/10"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* ミニ太極図 */}
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 背景円（黒） */}
                <circle cx="50" cy="50" r="48" fill="var(--yin)" />
                {/* 陽（白）半円：上半分 + S字カーブ */}
                <path
                  d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
                  fill="var(--yang)"
                  className="opacity-90"
                />
                {/* 外円（装飾） */}
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="var(--yang)"
                  strokeWidth="2"
                  className="opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                />
                {/* 陰中の陽（上の黒い部分の中の白丸） */}
                <circle cx="50" cy="26" r="6" fill="var(--yang)" />
                {/* 陽中の陰（下の白い部分の中の黒丸） */}
                <circle cx="50" cy="74" r="6" fill="var(--yin)" />
              </svg>
            </div>
            <span className="font-serif text-lg tracking-widest text-yang group-hover:text-earth transition-colors duration-300">
              虚ろの子
            </span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm tracking-widest text-yang/70 hover:text-yang transition-colors duration-300 group"
              >
                {item.label}
                {/* ホバー時のアンダーライン */}
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ backgroundColor: item.color }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="メニュー"
          >
            <motion.span
              className="w-6 h-px bg-yang"
              animate={{
                rotate: isMobileMenuOpen ? 45 : 0,
                y: isMobileMenuOpen ? 4 : 0,
              }}
            />
            <motion.span
              className="w-6 h-px bg-yang"
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
            />
            <motion.span
              className="w-6 h-px bg-yang"
              animate={{
                rotate: isMobileMenuOpen ? -45 : 0,
                y: isMobileMenuOpen ? -4 : 0,
              }}
            />
          </button>
        </div>
      </motion.header>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-yin/95 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="font-serif text-2xl tracking-widest text-yang hover:text-earth transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
