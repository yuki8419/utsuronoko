import fs from "fs";
import path from "path";

export interface Episode {
  id: string;
  title: string;
  number: number;
  content?: string;
}

export interface Chapter {
  id: string;
  title: string;
  number: number;
  episodes: Episode[];
}

export interface Part {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface NovelStructure {
  parts: Part[];
}

// 本編のベースパス（プロジェクトルートからの相対パス）
const NOVEL_BASE_PATH = path.join(process.cwd(), "..", "本編");

// ファイル名からタイトルを抽出
function extractTitle(filename: string): string {
  // "第1話_平穏な日々.md" -> "平穏な日々"
  // "プロローグ①_虚ろの子.md" -> "虚ろの子"
  const match = filename.match(/[_](.+)\.md$/);
  return match ? match[1] : filename.replace(".md", "");
}

// ファイル名から話数を抽出
function extractNumber(filename: string): number {
  const match = filename.match(/第(\d+)話/);
  if (match) return parseInt(match[1]);

  // プロローグの場合
  const prologueMatch = filename.match(/[①②③④⑤⑥⑦⑧⑨⑩]/);
  if (prologueMatch) {
    const nums: Record<string, number> = { "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5, "⑥": 6, "⑦": 7, "⑧": 8, "⑨": 9, "⑩": 10 };
    return nums[prologueMatch[0]] || 1;
  }
  return 1;
}

// 小説の構造を取得
export function getNovelStructure(): NovelStructure {
  const parts: Part[] = [];

  // プロローグ
  const prologuePath = path.join(NOVEL_BASE_PATH, "プロローグ");
  if (fs.existsSync(prologuePath)) {
    const prologueFiles = fs.readdirSync(prologuePath)
      .filter(f => f.endsWith(".md"))
      .sort((a, b) => extractNumber(a) - extractNumber(b));

    if (prologueFiles.length > 0) {
      const episodes: Episode[] = prologueFiles.map(f => ({
        id: `ep${extractNumber(f)}`,
        title: extractTitle(f),
        number: extractNumber(f),
      }));

      parts.push({
        id: "prologue",
        title: "プロローグ",
        chapters: [{
          id: "prologue",
          title: "プロローグ",
          number: 0,
          episodes,
        }],
      });
    }
  }

  // 第一部（全章公開）
  const part1Path = path.join(NOVEL_BASE_PATH, "第一部");
  if (fs.existsSync(part1Path)) {
    const chapterDirs = fs.readdirSync(part1Path)
      .filter(d => d.startsWith("第") && d.includes("章"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/第(\d+)章/)?.[1] || "0");
        const numB = parseInt(b.match(/第(\d+)章/)?.[1] || "0");
        return numA - numB;
      });

    const chapters: Chapter[] = chapterDirs.map(chapterDir => {
      const chapterPath = path.join(part1Path, chapterDir);
      const episodeFiles = fs.readdirSync(chapterPath)
        .filter(f => f.endsWith(".md"))
        .sort((a, b) => extractNumber(a) - extractNumber(b));

      const episodes: Episode[] = episodeFiles.map(f => ({
        id: `ep${extractNumber(f)}`,
        title: extractTitle(f),
        number: extractNumber(f),
      }));

      const chapterNum = parseInt(chapterDir.match(/第(\d+)章/)?.[1] || "1");

      return {
        id: `chapter${chapterNum}`,
        title: chapterDir,
        number: chapterNum,
        episodes,
      };
    });

    parts.push({
      id: "part1",
      title: "第一部「日常の終焉」",
      chapters,
    });
  }

  return { parts };
}

// エピソードの本文を取得
export function getEpisodeContent(partId: string, chapterId: string, episodeId: string): string | null {
  let filePath: string;

  if (partId === "prologue") {
    // プロローグ
    const prologuePath = path.join(NOVEL_BASE_PATH, "プロローグ");
    const files = fs.readdirSync(prologuePath).filter(f => f.endsWith(".md"));

    // episodeId から番号を抽出して対応するファイルを探す
    const episodeNum = episodeId.match(/(\d+)/)?.[1] || "1";
    const nums: Record<string, string> = { "1": "①", "2": "②", "3": "③" };
    const targetFile = files.find(f => f.includes(nums[episodeNum] || "①"));

    if (!targetFile) return null;
    filePath = path.join(prologuePath, targetFile);
  } else {
    // 第一部以降
    const partPath = path.join(NOVEL_BASE_PATH, "第一部");
    const chapterNum = chapterId.replace("chapter", "");
    const chapterDir = `第${chapterNum}章`;
    const chapterPath = path.join(partPath, chapterDir);

    if (!fs.existsSync(chapterPath)) return null;

    const files = fs.readdirSync(chapterPath).filter(f => f.endsWith(".md"));
    const episodeNum = episodeId.replace("ep", "");
    const targetFile = files.find(f => f.includes(`第${episodeNum}話`));

    if (!targetFile) return null;
    filePath = path.join(chapterPath, targetFile);
  }

  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");

  // タイトル行を除去して本文のみ返す
  const lines = content.split("\n");
  const bodyStart = lines.findIndex((line, i) => i > 0 && line.startsWith("---")) + 1;

  return lines.slice(bodyStart).join("\n").trim();
}

// 前後のエピソード情報を取得
export function getAdjacentEpisodes(partId: string, chapterId: string, episodeId: string) {
  const structure = getNovelStructure();

  // 全エピソードをフラットに
  const allEpisodes: { partId: string; chapterId: string; episodeId: string; title: string }[] = [];

  for (const part of structure.parts) {
    for (const chapter of part.chapters) {
      for (const episode of chapter.episodes) {
        allEpisodes.push({
          partId: part.id,
          chapterId: chapter.id,
          episodeId: episode.id,
          title: episode.title,
        });
      }
    }
  }

  const currentIndex = allEpisodes.findIndex(
    ep => ep.partId === partId && ep.chapterId === chapterId && ep.episodeId === episodeId
  );

  return {
    prev: currentIndex > 0 ? allEpisodes[currentIndex - 1] : null,
    next: currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null,
  };
}
