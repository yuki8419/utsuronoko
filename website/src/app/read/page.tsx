"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

interface Episode {
  id: string;
  title: string;
  number: number;
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  episodes: Episode[];
}

interface Part {
  id: string;
  title: string;
  chapters: Chapter[];
}

interface NovelStructure {
  parts: Part[];
}

export default function ReadPage() {
  const [structure, setStructure] = useState<NovelStructure | null>(null);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set(["prologue", "part1"]));

  useEffect(() => {
    fetch("/data/structure.json")
      .then((res) => res.json())
      .then((data) => setStructure(data));
  }, []);

  const togglePart = (partId: string) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-yin pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* ヘッダー */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-yang mb-4">
              本編を読む
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-earth/50" />
              <div className="w-1.5 h-1.5 bg-earth rotate-45" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-earth/50" />
            </div>
          </motion.div>

          {/* 目次 */}
          {structure ? (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {structure.parts.map((part, partIndex) => (
                <motion.div
                  key={part.id}
                  className="border border-yang/10 rounded-lg overflow-hidden bg-yang/[0.02]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + partIndex * 0.1, duration: 0.6 }}
                >
                  {/* 部タイトル */}
                  <button
                    onClick={() => togglePart(part.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-yang/[0.03] transition-colors duration-300"
                  >
                    <h2 className="font-serif text-xl tracking-[0.15em] text-yang">
                      {part.title}
                    </h2>
                    <motion.div
                      animate={{ rotate: expandedParts.has(part.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        className="w-5 h-5 text-yang/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </button>

                  {/* 章・話一覧 */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedParts.has(part.id) ? "auto" : 0,
                      opacity: expandedParts.has(part.id) ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-6">
                      {part.chapters.map((chapter) => (
                        <div key={chapter.id}>
                          {/* 章タイトル（プロローグ以外） */}
                          {chapter.id !== "prologue" && (
                            <h3 className="text-sm text-earth tracking-[0.1em] mb-3 pl-2 border-l-2 border-earth/50">
                              {chapter.title}
                            </h3>
                          )}

                          {/* 話一覧 */}
                          <div className="grid gap-2">
                            {chapter.episodes.map((episode, epIndex) => (
                              <Link
                                key={episode.id}
                                href={`/read/${part.id}/${chapter.id}/${episode.id}`}
                                className="group block"
                              >
                                <motion.div
                                  className="px-4 py-3 rounded-md bg-yang/[0.02] hover:bg-yang/[0.06] border border-transparent hover:border-yang/10 transition-all duration-300"
                                  whileHover={{ x: 4 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted/50 font-mono w-8">
                                      {String(episode.number).padStart(2, "0")}
                                    </span>
                                    <span className="text-yang/90 group-hover:text-yang transition-colors duration-300">
                                      {episode.title}
                                    </span>
                                    <svg
                                      className="w-4 h-4 text-yang/30 group-hover:text-yang/60 ml-auto transition-all duration-300 group-hover:translate-x-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* ローディング */
            <div className="flex justify-center py-20">
              <motion.div
                className="w-8 h-8 border-2 border-yang/20 border-t-earth rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* 背景エフェクト */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-wood/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-water/5 rounded-full blur-[120px]" />
        </div>
      </main>
      <Footer />
    </>
  );
}
