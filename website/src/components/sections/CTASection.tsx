"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      ref={ref}
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24"
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* CTAボタン */}
        <Link href="/read" className="inline-block">
          <motion.div
            className="relative px-12 py-5 border border-yang/30 cursor-pointer overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 背景エフェクト */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-wood via-fire via-earth via-metal to-water opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            />

            {/* 命刻が刻まれるエフェクト */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.1 : 0 }}
            >
              {["甲", "乙", "丙", "丁", "戊"].map((char, i) => (
                <motion.span
                  key={char}
                  className="absolute font-serif text-6xl text-earth"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: isHovered ? [0, 0.3, 0] : 0,
                    scale: isHovered ? [0.5, 1.2, 1.5] : 0.5,
                  }}
                  transition={{
                    delay: i * 0.1,
                    duration: 1,
                    repeat: isHovered ? Infinity : 0,
                    repeatDelay: 0.5,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>

            {/* テキスト */}
            <span className="relative z-10 font-serif text-xl md:text-2xl tracking-[0.3em] text-yang group-hover:text-earth transition-colors duration-300">
              本編を読む
            </span>

            {/* コーナー装飾 */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-earth opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-earth opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-earth opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-earth opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </Link>

        {/* サブリンク */}
        <motion.div
          className="mt-12 flex gap-8 justify-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link
            href="/story"
            className="text-muted hover:text-wood transition-colors duration-300 text-sm tracking-widest"
          >
            世界観
          </Link>
          <Link
            href="/characters"
            className="text-muted hover:text-fire transition-colors duration-300 text-sm tracking-widest"
          >
            登場人物
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
