import { NextResponse } from "next/server";
import { getNovelStructure } from "@/lib/novel";

export async function GET() {
  try {
    const structure = getNovelStructure();
    return NextResponse.json(structure);
  } catch (error) {
    console.error("Failed to get novel structure:", error);
    return NextResponse.json({ parts: [] }, { status: 500 });
  }
}
