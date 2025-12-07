"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// 多層パララックス背景（軽量版）
export default function ParallaxLayers() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 30,
    restDelta: 0.01,
  });

  // 各レイヤーの速度
  const layer1Y = useTransform(smoothProgress, [0, 1], ["0%", "-20%"]);
  const layer2Y = useTransform(smoothProgress, [0, 1], ["0%", "-40%"]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* レイヤー1: 遠景の大きな円 */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: layer1Y }}
      >
        <div
          className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(45, 90, 74, 0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[60%] right-[10%] w-[350px] h-[350px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(30, 58, 95, 0.06) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* レイヤー2: 浮遊する光の粒（数を減らす） */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: layer2Y }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${12 + (i * 11) % 76}%`,
              top: `${18 + (i * 9) % 64}%`,
              width: 3,
              height: 3,
              background: `rgba(201, 169, 98, 0.2)`,
              boxShadow: `0 0 6px rgba(201, 169, 98, 0.3)`,
            }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4 + (i % 2),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* 五行シンボル（数を減らす＆アニメーション簡略化） */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: layer1Y }}>
        <div className="absolute top-[20%] left-[8%] text-wood/5 text-5xl font-serif select-none">
          木
        </div>
        <div className="absolute top-[50%] right-[10%] text-fire/5 text-5xl font-serif select-none">
          火
        </div>
        <div className="absolute top-[75%] left-[12%] text-water/5 text-5xl font-serif select-none">
          水
        </div>
      </motion.div>
    </div>
  );
}
