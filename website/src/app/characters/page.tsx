"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CharactersPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* 背景装飾 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-fire/5 blur-[120px]" />
      </div>

      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* タイトル */}
        <h1 className="font-serif text-3xl md:text-5xl text-yang mb-4 tracking-widest">
          登場人物
        </h1>

        {/* 装飾線 */}
        <motion.div
          className="w-24 h-px bg-gradient-to-r from-transparent via-fire to-transparent mx-auto mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* 準備中メッセージ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-yang/60 text-lg md:text-xl mb-2 tracking-wider">
            準備中
          </p>
          <p className="text-yang/40 text-sm md:text-base tracking-wide">
            Coming Soon
          </p>
        </motion.div>

        {/* 戻るリンク */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-yang/50 hover:text-yang transition-colors duration-300 text-sm tracking-wider"
          >
            <span>←</span>
            <span>トップへ戻る</span>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
