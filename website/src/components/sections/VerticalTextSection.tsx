"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function VerticalTextSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // 各テキストのアニメーション
  const text1X = useTransform(smoothProgress, [0, 0.3], [100, 0]);
  const text1Opacity = useTransform(smoothProgress, [0, 0.2, 0.7, 0.9], [0, 1, 1, 0]);

  const text2X = useTransform(smoothProgress, [0.1, 0.4], [100, 0]);
  const text2Opacity = useTransform(smoothProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

  const text3X = useTransform(smoothProgress, [0.2, 0.5], [100, 0]);
  const text3Opacity = useTransform(smoothProgress, [0.2, 0.4, 0.7, 0.9], [0, 1, 1, 0]);

  // 背景のグラデーション
  const bgOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 0.6, 0.6, 0]);

  const verticalTexts = [
    {
      text: "空白に生まれ",
      subtext: "全てを奪われた",
      x: text1X,
      opacity: text1Opacity,
    },
    {
      text: "理を見通し",
      subtext: "世界を知る",
      x: text2X,
      opacity: text2Opacity,
    },
    {
      text: "己の道を刻む",
      subtext: "虚ろの子",
      x: text3X,
      opacity: text3Opacity,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative h-[200vh] overflow-hidden"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center">
        {/* 背景エフェクト */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: bgOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yin-light/50 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-earth/5 blur-[100px]" />
        </motion.div>

        {/* 縦書きテキストコンテナ */}
        <div className="relative flex justify-center items-center gap-4 sm:gap-12 md:gap-24 lg:gap-32 h-full px-2 sm:px-4 py-16 sm:py-20 md:py-24">
          {verticalTexts.map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center shrink-0"
              style={{
                x: item.x,
                opacity: item.opacity,
              }}
            >
              {/* メインテキスト（縦書き） */}
              <div
                className="writing-vertical font-serif text-base sm:text-xl md:text-3xl lg:text-4xl text-yang tracking-[0.15em] sm:tracking-[0.3em] md:tracking-[0.4em] leading-relaxed whitespace-nowrap max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh]"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                }}
              >
                {item.text.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    className="inline-block relative"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{
                      delay: index * 0.1 + charIndex * 0.05,
                      duration: 0.5,
                    }}
                    viewport={{ once: true }}
                  >
                    <span className="absolute inset-0 blur-sm text-earth/30">
                      {char}
                    </span>
                    <span className="relative">{char}</span>
                  </motion.span>
                ))}
              </div>

              {/* サブテキスト */}
              <motion.div
                className="mt-4 sm:mt-8 text-yang/40 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em]"
                style={{
                  writingMode: "vertical-rl",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {item.subtext}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* 装飾線 */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-earth/30 to-transparent"
          style={{ opacity: bgOpacity }}
        />
      </div>
    </section>
  );
}
