"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
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

interface EpisodeContent {
  content: string;
  title: string;
}

interface AdjacentEpisode {
  partId: string;
  chapterId: string;
  episodeId: string;
  title: string;
}

export default function EpisodePage() {
  const params = useParams();
  const { part, chapter, episode } = params as {
    part: string;
    chapter: string;
    episode: string;
  };

  const [structure, setStructure] = useState<NovelStructure | null>(null);
  const [episodes, setEpisodes] = useState<Record<string, EpisodeContent> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/structure.json").then((res) => res.json()),
      fetch("/data/episodes.json").then((res) => res.json()),
    ]).then(([structureData, episodesData]) => {
      setStructure(structureData);
      setEpisodes(episodesData);
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, []);

  // 現在のエピソードデータ
  const episodeKey = `${part}_${chapter}_${episode}`;
  const currentEpisode = episodes?.[episodeKey];

  // 前後のエピソード計算
  const { prev, next } = useMemo(() => {
    if (!structure) return { prev: null, next: null };

    const allEpisodes: AdjacentEpisode[] = [];
    for (const p of structure.parts) {
      for (const c of p.chapters) {
        for (const e of c.episodes) {
          allEpisodes.push({
            partId: p.id,
            chapterId: c.id,
            episodeId: e.id,
            title: e.title,
          });
        }
      }
    }

    const currentIndex = allEpisodes.findIndex(
      (ep) => ep.partId === part && ep.chapterId === chapter && ep.episodeId === episode
    );

    return {
      prev: currentIndex > 0 ? allEpisodes[currentIndex - 1] : null,
      next: currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null,
    };
  }, [structure, part, chapter, episode]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-yin pt-24 pb-16 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-2 border-yang/20 border-t-earth rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </main>
        <Footer />
      </>
    );
  }

  if (!currentEpisode) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-yin pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-muted">エピソードが見つかりませんでした</p>
            <Link
              href="/read"
              className="inline-block mt-8 text-earth hover:text-earth/80 transition-colors"
            >
              ← 目次に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-yin pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          {/* パンくずリスト */}
          <motion.nav
            className="mb-8 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ol className="flex items-center gap-2 text-muted/60">
              <li>
                <Link href="/read" className="hover:text-yang transition-colors">
                  本編
                </Link>
              </li>
              <li>/</li>
              <li className="text-yang/80">{currentEpisode.title}</li>
            </ol>
          </motion.nav>

          {/* タイトル */}
          <motion.header
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-2xl md:text-3xl tracking-[0.15em] text-yang mb-6">
              {currentEpisode.title}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-earth/50" />
              <div className="w-1.5 h-1.5 bg-earth rotate-45" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-earth/50" />
            </div>
          </motion.header>

          {/* 本文 */}
          <motion.div
            className="prose prose-invert prose-lg max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="novel-content text-yang/90 leading-[2.2] tracking-wide font-serif">
              {currentEpisode.content.split("\n\n").map((paragraph, index) => {
                // 空の段落はスキップ
                if (!paragraph.trim()) return null;

                // 水平線は区切りとして表示
                if (paragraph.trim() === "---") {
                  return (
                    <div key={index} className="flex items-center justify-center my-8 gap-4">
                      <div className="h-px w-16 bg-yang/20" />
                      <div className="w-1 h-1 bg-yang/30 rotate-45" />
                      <div className="h-px w-16 bg-yang/20" />
                    </div>
                  );
                }

                return (
                  <p key={index} className="mb-6 text-justify indent-[1em]">
                    {paragraph.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < paragraph.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          </motion.div>

          {/* ナビゲーション */}
          <motion.nav
            className="mt-16 pt-8 border-t border-yang/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* 前の話 */}
              {prev ? (
                <Link
                  href={`/read/${prev.partId}/${prev.chapterId}/${prev.episodeId}`}
                  className="group flex-1 max-w-[45%]"
                >
                  <motion.div
                    className="p-4 rounded-lg border border-yang/10 hover:border-yang/20 hover:bg-yang/[0.02] transition-all duration-300"
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs text-muted/50 block mb-1">前の話</span>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-yang/40 group-hover:text-yang/60 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <span className="text-yang/80 group-hover:text-yang transition-colors truncate">
                        {prev.title}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {/* 目次へ */}
              <Link
                href="/read"
                className="px-4 py-2 text-sm text-muted hover:text-yang transition-colors"
              >
                目次
              </Link>

              {/* 次の話 */}
              {next ? (
                <Link
                  href={`/read/${next.partId}/${next.chapterId}/${next.episodeId}`}
                  className="group flex-1 max-w-[45%]"
                >
                  <motion.div
                    className="p-4 rounded-lg border border-yang/10 hover:border-yang/20 hover:bg-yang/[0.02] transition-all duration-300 text-right"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs text-muted/50 block mb-1">次の話</span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-yang/80 group-hover:text-yang transition-colors truncate">
                        {next.title}
                      </span>
                      <svg
                        className="w-4 h-4 text-yang/40 group-hover:text-yang/60 transition-colors"
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
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </motion.nav>
        </article>

        {/* 背景エフェクト */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-earth/3 rounded-full blur-[200px]" />
        </div>
      </main>
      <Footer />
    </>
  );
}
