"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

const TaijiSymbol = dynamic(
  () => import("@/components/three/TaijiSymbol"),
  { ssr: false }
);

const BrushTitle = dynamic(
  () => import("@/components/ui/BrushTitle"),
  { ssr: false }
);

// モバイル判定フック
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// シンプルな2D太極図（モバイル用）
function SimpleTaiji() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="50" cy="50" r="48" fill="var(--yin)" />
      <path
        d="M50 2 A48 48 0 0 1 50 98 A24 24 0 0 1 50 50 A24 24 0 0 0 50 2"
        fill="var(--yang)"
      />
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--earth)" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="26" r="6" fill="var(--yin)" />
      <circle cx="50" cy="74" r="6" fill="var(--yang)" />
    </motion.svg>
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const { scrollYProgress } = useScroll();
  const isMobile = useIsMobile();

  // smoothstep関数（共通で使用）
  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  // springを使わず直接transformで変換（ガタつき防止）
  // 全てのアニメーションに同じイージング関数を適用して同期
  const separationProgress = useTransform(
    scrollYProgress,
    [0, 0.25],
    [0, 1],
    { ease: smoothstep }
  );
  const taijiScale = useTransform(
    scrollYProgress,
    [0, 0.25],
    [1, 0.85],
    { ease: smoothstep }
  );
  const taijiOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.25],
    [1, 0],
    { ease: smoothstep }
  );
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.15],
    [1, 0],
    { ease: smoothstep }
  );
  const titleY = useTransform(
    scrollYProgress,
    [0, 0.15],
    [0, -20],
    { ease: smoothstep }
  );

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowTitle(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-[150vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* 太極図 */}
        <motion.div
          className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] mb-6 md:mb-8"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: isMobile ? 0.5 : 2.0,
            duration: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
            opacity: { delay: isMobile ? 0.3 : 1.8, duration: 0.8 },
          }}
          style={{
            opacity: taijiOpacity,
            transformOrigin: "center center",
            willChange: "transform, opacity",
          }}
        >
          {mounted && (
            isMobile ? (
              <SimpleTaiji />
            ) : (
              <TaijiSymbol
                separationMotionValue={separationProgress}
                scaleMotionValue={taijiScale}
              />
            )
          )}
        </motion.div>

        {/* タイトル */}
        <motion.div
          className="text-center"
          style={{
            opacity: titleOpacity,
            y: titleY,
            willChange: "transform, opacity",
          }}
        >
          {showTitle && <BrushTitle text="虚ろの子" delay={0.5} className="mb-6" />}
          <motion.p
            className="text-yang/50 text-xs sm:text-sm md:text-lg tracking-[0.15em] sm:tracking-[0.2em] font-light px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={showTitle ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            ── 空白に刻まれし理 ──
          </motion.p>
        </motion.div>

        {/* 中央の控えめなグロー */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-earth/3 rounded-full blur-[120px]" />
        </div>
      </div>
    </section>
  );
}
