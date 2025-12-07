"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export default function SectionTransition({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 方向に応じた初期位置
  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return { y: 100, x: 0 };
      case "down":
        return { y: -100, x: 0 };
      case "left":
        return { y: 0, x: 100 };
      case "right":
        return { y: 0, x: -100 };
    }
  };

  const initial = getInitialTransform();

  // スクロール連動のトランスフォーム
  const y = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [initial.y, 0, 0, -initial.y]);
  const x = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [initial.x, 0, 0, -initial.x]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  // 墨の広がりエフェクト
  const inkSpread = useTransform(smoothProgress, [0, 0.3], [0, 1]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ y, x, opacity, scale }}
    >
      {/* 墨のマスクエフェクト */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at 50% 0%, transparent ${useTransform(inkSpread, [0, 1], ["0%", "150%"]).get()}, rgba(10,10,10,0.8) 0%)`,
        }}
      />

      {/* コンテンツ */}
      {children}
    </motion.div>
  );
}

// セクション間のデコレーティブ区切り線
export function SectionDivider({ variant = "ink" }: { variant?: "ink" | "brush" | "dots" }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  if (variant === "ink") {
    return (
      <div ref={ref} className="relative h-32 flex items-center justify-center overflow-hidden">
        {/* 中央の線 */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-earth/50 to-transparent"
          style={{ width: lineWidth, opacity }}
        />

        {/* 墨滴装飾 */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-earth/30"
          style={{
            opacity,
            scale: useTransform(scrollYProgress, [0, 1], [0, 1]),
          }}
        />

        {/* 左右の滲み */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-32 h-8 blur-xl bg-earth/10"
          style={{ opacity: useTransform(scrollYProgress, [0, 1], [0, 0.5]) }}
        />
      </div>
    );
  }

  if (variant === "brush") {
    return (
      <div ref={ref} className="relative h-24 flex items-center justify-center">
        <svg className="w-full max-w-md h-12" viewBox="0 0 400 50">
          <motion.path
            d="M0,25 Q50,10 100,25 T200,25 T300,25 T400,25"
            fill="none"
            stroke="rgba(201, 169, 98, 0.4)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              pathLength: useTransform(scrollYProgress, [0, 1], [0, 1]),
              opacity,
            }}
          />
        </svg>
      </div>
    );
  }

  // dots variant
  return (
    <div ref={ref} className="relative h-16 flex items-center justify-center gap-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-earth/40"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.3 + i * 0.2], [0, 1]),
            scale: useTransform(scrollYProgress, [0, 0.3 + i * 0.2], [0, 1]),
          }}
        />
      ))}
    </div>
  );
}

// スクロールで表示されるセクションヘッダー
export function AnimatedSectionHeader({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const titleChars = title.split("");

  return (
    <div
      ref={ref}
      className={`mb-12 ${
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
      }`}
    >
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-yang tracking-wider mb-4">
        {titleChars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.3 + i * 0.05, 0.5], [0, 0, 1]),
              y: useTransform(scrollYProgress, [0, 0.3 + i * 0.05, 0.5], [30, 30, 0]),
              filter: useTransform(
                scrollYProgress,
                [0, 0.3 + i * 0.05, 0.5],
                ["blur(8px)", "blur(8px)", "blur(0px)"]
              ),
            }}
          >
            {char}
          </motion.span>
        ))}
      </h2>

      {subtitle && (
        <motion.p
          className="text-yang/50 text-sm tracking-[0.3em]"
          style={{
            opacity: useTransform(scrollYProgress, [0.4, 0.6], [0, 1]),
            y: useTransform(scrollYProgress, [0.4, 0.6], [20, 0]),
          }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* 装飾線 */}
      <motion.div
        className={`h-px bg-gradient-to-r from-transparent via-earth/30 to-transparent mt-6 ${
          align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
        }`}
        style={{
          width: useTransform(scrollYProgress, [0.3, 0.6], ["0%", "200px"]),
          opacity: useTransform(scrollYProgress, [0.3, 0.6], [0, 1]),
        }}
      />
    </div>
  );
}
