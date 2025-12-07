"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface StoryBlock {
  text: string;
  highlight?: string;
  color?: string;
}

const storyBlocks: StoryBlock[] = [
  {
    text: "この世界では、生まれた瞬間に魂へ「命刻」が刻まれる。",
  },
  {
    text: "命刻は、その者の運命を定める絶対の法則。",
    highlight: "命刻",
    color: "var(--earth)",
  },
  {
    text: "誰も、その理から逃れることはできない。",
  },
  {
    text: "──ただ一人を除いて。",
    highlight: "一人",
    color: "var(--fire)",
  },
];

function StoryBlock({
  block,
  index,
  progress,
}: {
  block: StoryBlock;
  index: number;
  progress: number;
}) {
  // 各ブロックの表示タイミングを計算
  const blockCount = storyBlocks.length;
  const blockStart = index / blockCount;
  const blockEnd = (index + 1) / blockCount;
  const blockMiddle = (blockStart + blockEnd) / 2;

  // フェードイン・アウト
  const opacity =
    progress < blockStart
      ? 0
      : progress < blockMiddle
      ? (progress - blockStart) / (blockMiddle - blockStart)
      : progress < blockEnd
      ? 1 - (progress - blockMiddle) / (blockEnd - blockMiddle)
      : 0;

  // Y軸の動き
  const y =
    progress < blockStart
      ? 50
      : progress < blockMiddle
      ? 50 - ((progress - blockStart) / (blockMiddle - blockStart)) * 50
      : progress < blockEnd
      ? ((progress - blockMiddle) / (blockEnd - blockMiddle)) * -30
      : -30;

  // テキストにハイライトを適用
  const renderText = () => {
    if (!block.highlight) {
      return <span>{block.text}</span>;
    }

    const parts = block.text.split(block.highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: block.color }}>{block.highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{
        opacity,
        y,
      }}
    >
      <p className="font-serif text-sm sm:text-lg md:text-2xl lg:text-3xl text-center leading-relaxed text-yang/90 whitespace-nowrap">
        {renderText()}
      </p>
    </motion.div>
  );
}

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // スクロール進行度を0-1で取得
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${(storyBlocks.length + 1) * 100}vh` }}
    >
      {/* 固定表示エリア */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201, 169, 98, 0.03) 0%, transparent 70%)",
              scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]),
              opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
            }}
          />
        </div>

        {/* ストーリーブロック */}
        <motion.div className="relative w-full h-full">
          {storyBlocks.map((block, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
            >
              <StoryBlockContent block={block} index={index} scrollProgress={progress} />
            </motion.div>
          ))}
        </motion.div>

        {/* スクロールインジケーター */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 0.3, 0.3, 0]),
          }}
        >
          <div className="flex gap-2 mb-4">
            {storyBlocks.map((_, index) => (
              <ProgressDot key={index} index={index} scrollProgress={progress} />
            ))}
          </div>
          <motion.div
            className="w-px h-6 bg-gradient-to-b from-yang/30 to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

// 別コンポーネントに分離してuseTransformを使用
function StoryBlockContent({
  block,
  index,
  scrollProgress,
}: {
  block: StoryBlock;
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const blockCount = storyBlocks.length;
  const blockStart = index / blockCount;
  const blockEnd = (index + 1) / blockCount;
  const blockMiddle = (blockStart + blockEnd) / 2;

  const opacity = useTransform(scrollProgress, (p: number) => {
    if (p < blockStart) return 0;
    if (p < blockMiddle) return (p - blockStart) / (blockMiddle - blockStart);
    if (p < blockEnd) return 1 - (p - blockMiddle) / (blockEnd - blockMiddle);
    return 0;
  });

  const y = useTransform(scrollProgress, (p: number) => {
    if (p < blockStart) return 50;
    if (p < blockMiddle) return 50 - ((p - blockStart) / (blockMiddle - blockStart)) * 50;
    if (p < blockEnd) return ((p - blockMiddle) / (blockEnd - blockMiddle)) * -30;
    return -30;
  });

  // テキストにハイライトを適用
  const renderText = () => {
    if (!block.highlight) {
      return <span>{block.text}</span>;
    }

    const parts = block.text.split(block.highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: block.color }}>{block.highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ opacity, y }}
    >
      <p className="font-serif text-sm sm:text-lg md:text-2xl lg:text-3xl text-center leading-relaxed text-yang/90 whitespace-nowrap">
        {renderText()}
      </p>
    </motion.div>
  );
}

function ProgressDot({
  index,
  scrollProgress,
}: {
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const blockCount = storyBlocks.length;
  const blockStart = index / blockCount;
  const blockEnd = (index + 1) / blockCount;

  const isActive = useTransform(scrollProgress, (p: number) => {
    return p >= blockStart && p < blockEnd;
  });

  const scale = useTransform(scrollProgress, (p: number) => {
    return p >= blockStart && p < blockEnd ? 1.5 : 1;
  });

  const bgOpacity = useTransform(scrollProgress, (p: number) => {
    return p >= blockStart && p < blockEnd ? 1 : 0.3;
  });

  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-earth"
      style={{
        scale,
        opacity: bgOpacity,
      }}
    />
  );
}
