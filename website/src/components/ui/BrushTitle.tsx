"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface BrushTitleProps {
  text: string;
  delay?: number;
  className?: string;
}

// 筆のストローク効果を持つ文字コンポーネント
function BrushCharacter({
  char,
  delay,
  index,
}: {
  char: string;
  delay: number;
  index: number;
}) {
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      controls.start("visible");
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [controls, delay]);

  // 文字ごとの筆書きアニメーション
  const charVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  // 筆圧のような効果
  const strokeVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 1.2,
          ease: [0.65, 0, 0.35, 1] as const,
        },
        opacity: { duration: 0.2 },
      },
    },
  };

  return (
    <motion.span
      className="inline-block relative"
      variants={charVariants}
      initial="hidden"
      animate={controls}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* 墨の飛沫エフェクト */}
      <motion.span
        className="absolute -inset-6 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-earth/60 to-yang/40"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isVisible
                ? {
                    scale: [0, 2, 0],
                    opacity: [0, 0.9, 0],
                    x: (Math.random() - 0.5) * 40,
                    y: (Math.random() - 0.5) * 40,
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: 0.03 * i,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.span>

      {/* 外側のソフトグロー */}
      <motion.span
        className="absolute inset-0 blur-2xl"
        style={{ color: "rgba(201, 169, 98, 0.3)" }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={isVisible ? { opacity: [0, 0.6, 0.3], scale: [1.3, 1.1, 1] } : { opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.1 }}
      >
        {char}
      </motion.span>

      {/* 内側のシャープなグロー */}
      <motion.span
        className="absolute inset-0 blur-md"
        style={{ color: "rgba(245, 245, 240, 0.5)" }}
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: [0, 1, 0.6] } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {char}
      </motion.span>

      {/* 筆跡のSVGオーバーレイ - より洗練されたパス */}
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 60 80"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 2, delay: 0.2 }}
      >
        {/* 複数の筆跡ライン */}
        <motion.path
          d={`M${5 + index * 3},${25 + index * 5} Q${35},${15 + index * 3} ${55 - index * 2},${35 + index * 4}`}
          fill="none"
          stroke="rgba(201, 169, 98, 0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          variants={strokeVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        />
        <motion.path
          d={`M${15 + index * 2},${55} Q${30 + index},${45} ${50},${60 - index * 3}`}
          fill="none"
          stroke="rgba(201, 169, 98, 0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          variants={strokeVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        />
      </motion.svg>

      {/* 実際の文字 - グラデーション風の重ね効果 */}
      <span className="relative z-10 bg-gradient-to-b from-yang via-yang to-yang-dark bg-clip-text">
        {char}
      </span>
    </motion.span>
  );
}

export default function BrushTitle({
  text,
  delay = 0,
  className = "",
}: BrushTitleProps) {
  const characters = text.split("");

  return (
    <h1
      className={`title-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-yang relative ${className}`}
    >
      {characters.map((char, index) => (
        <BrushCharacter
          key={index}
          char={char}
          delay={delay + index * 0.3}
          index={index}
        />
      ))}

      {/* 上部の装飾線 */}
      <motion.svg
        className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 w-3/4 h-4 pointer-events-none"
        viewBox="0 0 300 20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + characters.length * 0.3 + 0.3, duration: 0.6 }}
      >
        <motion.path
          d="M0,10 Q75,3 150,10 Q225,17 300,10"
          fill="none"
          stroke="rgba(201, 169, 98, 0.2)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: delay + characters.length * 0.3 + 0.3,
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      </motion.svg>

      {/* 下部の装飾線（メイン） */}
      <motion.svg
        className="absolute -bottom-6 sm:-bottom-8 left-0 w-full h-10 pointer-events-none"
        viewBox="0 0 400 40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + characters.length * 0.3 + 0.5, duration: 0.8 }}
      >
        {/* メインの筆払い線 */}
        <motion.path
          d="M20,20 Q100,8 200,20 Q300,32 380,15"
          fill="none"
          stroke="rgba(201, 169, 98, 0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: delay + characters.length * 0.3 + 0.5,
            duration: 1.8,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
        {/* サブの細い線 */}
        <motion.path
          d="M50,25 Q150,35 250,22 Q350,10 390,20"
          fill="none"
          stroke="rgba(201, 169, 98, 0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: delay + characters.length * 0.3 + 0.8,
            duration: 1.5,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      </motion.svg>

      {/* 左右の装飾点 */}
      <motion.div
        className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-earth/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + characters.length * 0.3 + 1, duration: 0.4 }}
      />
      <motion.div
        className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-earth/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + characters.length * 0.3 + 1.1, duration: 0.4 }}
      />
    </h1>
  );
}
