"use client";

import { useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface InkDrop {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function InkFlowEffect() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 30,
    restDelta: 0.01,
  });

  // 墨滴のデータをメモ化（数を減らす）
  const inkDrops: InkDrop[] = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + (i * 15) % 70,
      y: 20 + (i * 12) % 60,
      size: 80 + (i * 30) % 100,
      delay: i * 0.8,
      duration: 4 + (i % 3),
    })), []
  );

  // スクロール連動の墨の帯の位置
  const bandY = useTransform(smoothProgress, [0, 1], ["-30%", "-120%"]);

  return (
    <>
      {/* CSS墨滴エフェクト（軽量版） */}
      <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden">
        {inkDrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              width: drop.size,
              height: drop.size,
              background: `radial-gradient(circle, rgba(10,10,10,0.08) 0%, transparent 60%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* スクロール連動の墨の帯（シンプル版） */}
      <motion.div
        className="fixed left-0 right-0 h-[150vh] pointer-events-none z-[3] will-change-transform"
        style={{
          top: bandY,
          background: `
            linear-gradient(
              180deg,
              transparent 0%,
              rgba(10, 10, 10, 0.015) 30%,
              rgba(10, 10, 10, 0.03) 50%,
              rgba(10, 10, 10, 0.015) 70%,
              transparent 100%
            )
          `,
        }}
      />
    </>
  );
}
