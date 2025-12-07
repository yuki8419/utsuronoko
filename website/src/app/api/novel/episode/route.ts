import { NextRequest, NextResponse } from "next/server";
import { getEpisodeContent, getAdjacentEpisodes, getNovelStructure } from "@/lib/novel";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const part = searchParams.get("part");
  const chapter = searchParams.get("chapter");
  const episode = searchParams.get("episode");

  if (!part || !chapter || !episode) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const content = getEpisodeContent(part, chapter, episode);
    const adjacent = getAdjacentEpisodes(part, chapter, episode);

    // タイトルを取得
    const structure = getNovelStructure();
    let title = "";
    for (const p of structure.parts) {
      if (p.id === part) {
        for (const c of p.chapters) {
          if (c.id === chapter) {
            for (const e of c.episodes) {
              if (e.id === episode) {
                title = e.title;
                break;
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      content,
      title,
      prev: adjacent.prev,
      next: adjacent.next,
    });
  } catch (error) {
    console.error("Failed to get episode:", error);
    return NextResponse.json({ error: "Failed to get episode" }, { status: 500 });
  }
}
