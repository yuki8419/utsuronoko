"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const TaijiSymbol = dynamic(
  () => import("@/components/three/TaijiSymbol"),
  { ssr: false }
);

// シンプルな2D太極図（モバイル用）
function SimpleTaijiLoading() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="50" cy="50" r="48" fill="var(--yin)" />
      <path
        d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
        fill="var(--yang)"
      />
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--earth)" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="26" r="6" fill="var(--yang)" />
      <circle cx="50" cy="74" r="6" fill="var(--yin)" />
    </motion.svg>
  );
}

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // モバイル判定
    setIsMobile(window.innerWidth < 768);

    // プログレスバーのアニメーション
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // ローディング完了（モバイルは短縮）
    const loadTime = window.innerWidth < 768 ? 1200 : 2000;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-yin flex flex-col items-center justify-center will-change-transform"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            transition: {
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.8 },
              scale: { duration: 1.2 },
            },
          }}
        >
          {/* 背景のグラデーション */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-earth/5 blur-[100px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* ローディングコンテンツ */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 太極図（モバイルは2D、デスクトップは3D） */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8">
              {isMobile ? <SimpleTaijiLoading /> : <TaijiSymbol />}
            </div>

            {/* タイトル */}
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="font-serif text-xl sm:text-2xl text-yang tracking-[0.2em] sm:tracking-[0.3em] mb-2">
                虚ろの子
              </h2>
              <p className="text-yang/40 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em]">
                Loading...
              </p>
            </motion.div>

            {/* プログレスバー */}
            <div className="w-36 sm:w-48 h-px bg-yang/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-earth/50 via-earth to-earth/50"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* 装飾テキスト */}
          <motion.div
            className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <p className="text-yang/30 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] font-serif">
              空白に刻まれし理
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
