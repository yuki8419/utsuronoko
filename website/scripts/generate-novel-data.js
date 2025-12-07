// 小説データをJSONファイルとして出力するスクリプト
const fs = require('fs');
const path = require('path');

const NOVEL_BASE_PATH = path.join(__dirname, '..', '..', '本編');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data');

// 公開する章の上限（第1章と第2章のみ公開）
const PUBLISHED_CHAPTERS = 2;

// 出力ディレクトリを作成
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

// ファイル名からタイトルを抽出
function extractTitle(filename) {
  const match = filename.match(/[_](.+)\.md$/);
  return match ? match[1] : filename.replace('.md', '');
}

// ファイル名から話数を抽出
function extractNumber(filename) {
  const match = filename.match(/第(\d+)話/);
  if (match) return parseInt(match[1]);

  const prologueMatch = filename.match(/[①②③④⑤⑥⑦⑧⑨⑩]/);
  if (prologueMatch) {
    const nums = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5, '⑥': 6, '⑦': 7, '⑧': 8, '⑨': 9, '⑩': 10 };
    return nums[prologueMatch[0]] || 1;
  }
  return 1;
}

// Markdownファイルから本文を抽出
function extractContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 最初の --- の後から本文開始
  let bodyStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      bodyStartIndex = i + 1;
      break;
    }
  }

  if (bodyStartIndex === -1) {
    // --- がない場合は、## の次の行から
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('##')) {
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  if (bodyStartIndex === -1) bodyStartIndex = 0;

  return lines.slice(bodyStartIndex).join('\n').trim();
}

// 小説の構造を取得
function getNovelStructure() {
  const parts = [];
  const episodes = {};

  // プロローグ（現在は非公開）
  // const prologuePath = path.join(NOVEL_BASE_PATH, 'プロローグ');
  // ...

  // 第一部（公開章のみ）
  const part1Path = path.join(NOVEL_BASE_PATH, '第一部');
  if (fs.existsSync(part1Path)) {
    const chapterDirs = fs.readdirSync(part1Path)
      .filter(d => d.startsWith('第') && d.includes('章'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/第(\d+)章/)?.[1] || '0');
        const numB = parseInt(b.match(/第(\d+)章/)?.[1] || '0');
        return numA - numB;
      })
      .filter(d => {
        const num = parseInt(d.match(/第(\d+)章/)?.[1] || '0');
        return num <= PUBLISHED_CHAPTERS;
      });

    const chapters = chapterDirs.map(chapterDir => {
      const chapterPath = path.join(part1Path, chapterDir);
      const episodeFiles = fs.readdirSync(chapterPath)
        .filter(f => f.endsWith('.md'))
        .sort((a, b) => extractNumber(a) - extractNumber(b));

      const chapterNum = parseInt(chapterDir.match(/第(\d+)章/)?.[1] || '1');
      const chapterId = `chapter${chapterNum}`;

      const chapterEpisodes = episodeFiles.map(f => {
        const epId = `ep${extractNumber(f)}`;
        const filePath = path.join(chapterPath, f);

        // エピソード内容を保存
        episodes[`part1_${chapterId}_${epId}`] = {
          content: extractContent(filePath),
          title: extractTitle(f),
        };

        return {
          id: epId,
          title: extractTitle(f),
          number: extractNumber(f),
        };
      });

      return {
        id: chapterId,
        title: chapterDir,
        number: chapterNum,
        episodes: chapterEpisodes,
      };
    });

    parts.push({
      id: 'part1',
      title: '第一部「日常の終焉」',
      chapters,
    });
  }

  return { structure: { parts }, episodes };
}

// メイン処理
console.log('小説データを生成中...');

const { structure, episodes } = getNovelStructure();

// 構造データを出力
fs.writeFileSync(
  path.join(OUTPUT_PATH, 'structure.json'),
  JSON.stringify(structure, null, 2),
  'utf-8'
);
console.log('✓ structure.json を生成しました');

// エピソードデータを出力
fs.writeFileSync(
  path.join(OUTPUT_PATH, 'episodes.json'),
  JSON.stringify(episodes, null, 2),
  'utf-8'
);
console.log('✓ episodes.json を生成しました');

// 統計情報
const totalEpisodes = Object.keys(episodes).length;
const totalParts = structure.parts.length;
let totalChapters = 0;
structure.parts.forEach(p => {
  totalChapters += p.chapters.length;
});

console.log(`\n生成完了:`);
console.log(`  - ${totalParts} 部`);
console.log(`  - ${totalChapters} 章`);
console.log(`  - ${totalEpisodes} 話`);
