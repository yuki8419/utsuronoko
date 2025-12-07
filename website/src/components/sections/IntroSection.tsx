"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "@/components/ui/MagneticButton";

export default function IntroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // パララックス効果
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const quoteY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const descY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const buttonY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const decorY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 overflow-hidden"
    >
      <motion.div
        className="max-w-2xl text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* 引用風のキャッチコピー */}
        <motion.div
          className="relative mb-8 sm:mb-12 p-4 sm:p-8 border border-yang/10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ y: quoteY }}
        >
          {/* 装飾の角 */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-earth" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-earth" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-earth" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-earth" />

          <p className="font-serif text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-relaxed text-yang/90">
            「お前の命刻は ──
            <br />
            <motion.span
              className="text-earth inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              空白
            </motion.span>
            だ」
          </p>
        </motion.div>

        {/* 説明文 */}
        <motion.p
          className="text-base sm:text-lg md:text-xl leading-loose text-yang/70"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ y: descY }}
        >
          すべてを奪われた少年が見つけたのは、
          <br />
          世界の<span className="text-fire">理</span>を書き換える力だった。
        </motion.p>

        {/* CTAボタン */}
        <motion.div
          className="mt-10 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ y: buttonY }}
        >
          <MagneticButton href="/read" className="px-6 sm:px-10 py-3 sm:py-4">
            <span className="font-serif text-base sm:text-lg tracking-[0.2em] sm:tracking-[0.25em] text-yang">
              本編を読む
            </span>
          </MagneticButton>
        </motion.div>

        {/* 装飾ライン */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{ y: decorY }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-wood" />
          <div className="w-2 h-2 bg-earth rotate-45" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-water" />
        </motion.div>
      </motion.div>
    </section>
  );
}
