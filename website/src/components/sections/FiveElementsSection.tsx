"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Element {
  name: string;
  kanji: string;
  guardian: string;
  meaning: string;
  color: string;
  glowColor: string;
}

const elements: Element[] = [
  {
    name: "木",
    kanji: "木",
    guardian: "青龍",
    meaning: "生",
    color: "var(--wood)",
    glowColor: "var(--wood-glow)",
  },
  {
    name: "火",
    kanji: "火",
    guardian: "朱雀",
    meaning: "長",
    color: "var(--fire)",
    glowColor: "var(--fire-glow)",
  },
  {
    name: "土",
    kanji: "土",
    guardian: "黄龍",
    meaning: "化",
    color: "var(--earth)",
    glowColor: "var(--earth-glow)",
  },
  {
    name: "金",
    kanji: "金",
    guardian: "白虎",
    meaning: "収",
    color: "var(--metal)",
    glowColor: "var(--metal-glow)",
  },
  {
    name: "水",
    kanji: "水",
    guardian: "玄武",
    meaning: "蔵",
    color: "var(--water)",
    glowColor: "var(--water-glow)",
  },
];

function ElementCard({
  element,
  index,
  isInView,
}: {
  element: Element;
  index: number;
  isInView: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* カード本体 */}
      <div
        className="relative w-28 h-40 md:w-36 md:h-52 flex flex-col items-center justify-center border border-yang/20 bg-yin-light/50 backdrop-blur-sm transition-all duration-500"
        style={{
          borderColor: isHovered ? element.color : undefined,
          boxShadow: isHovered
            ? `0 0 30px ${element.glowColor}40, inset 0 0 20px ${element.glowColor}20`
            : undefined,
        }}
      >
        {/* 漢字 */}
        <span
          className="font-serif text-4xl md:text-5xl transition-all duration-500"
          style={{ color: isHovered ? element.color : "var(--yang)" }}
        >
          {element.kanji}
        </span>

        {/* 守護獣 */}
        <span
          className="mt-3 text-sm tracking-widest transition-all duration-300"
          style={{
            color: isHovered ? element.color : "var(--muted)",
            opacity: isHovered ? 1 : 0.6,
          }}
        >
          {element.guardian}
        </span>

        {/* 意味 */}
        <motion.span
          className="absolute bottom-4 text-xs tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{ color: element.color }}
        >
          {element.meaning}
        </motion.span>

        {/* コーナー装飾 */}
        <div
          className="absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors duration-500"
          style={{ borderColor: isHovered ? element.color : "var(--yang)" }}
        />
        <div
          className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors duration-500"
          style={{ borderColor: isHovered ? element.color : "var(--yang)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors duration-500"
          style={{ borderColor: isHovered ? element.color : "var(--yang)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors duration-500"
          style={{ borderColor: isHovered ? element.color : "var(--yang)" }}
        />
      </div>

      {/* グローエフェクト */}
      <motion.div
        className="absolute inset-0 -z-10 blur-xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${element.glowColor}30 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  );
}

// 相生の矢印
function ConnectionArrow({ index, isInView }: { index: number; isInView: boolean }) {
  if (index >= elements.length - 1) return null;

  return (
    <motion.div
      className="hidden md:flex items-center justify-center w-8"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={isInView ? { opacity: 0.5, scaleX: 1 } : {}}
      transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12H19M19 12L13 6M19 12L13 18"
          stroke="var(--earth)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

export default function FiveElementsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
    >
      {/* セクションタイトル */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-yang mb-4">
          五 行
        </h2>
        <p className="text-muted text-sm tracking-widest">
          万物を構成する五つの理
        </p>
      </motion.div>

      {/* 五行カード */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-2">
        {elements.map((element, index) => (
          <div key={element.name} className="flex items-center">
            <ElementCard element={element} index={index} isInView={isInView} />
            <ConnectionArrow index={index} isInView={isInView} />
          </div>
        ))}
      </div>

      {/* 循環を示す円弧（モバイルでは非表示） */}
      <motion.div
        className="hidden md:block mt-12"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <p className="text-muted text-sm tracking-widest text-center">
          木 → 火 → 土 → 金 → 水 → 木 ...
        </p>
        <p className="text-muted/50 text-xs mt-2 text-center">
          相生の理により、万物は循環する
        </p>
      </motion.div>

      {/* 説明テキスト */}
      <motion.p
        className="max-w-xl text-center text-yang/60 mt-16 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        命刻が定める、すべての始まりと終わり。
        <br />
        この世界では、生まれた瞬間に魂へ刻まれる「命刻」が
        <br />
        その者の運命を決定づける。
      </motion.p>
    </section>
  );
}
