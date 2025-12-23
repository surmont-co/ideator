import { NextResponse } from "next/server";
import { fallbackSummary, generateSummaryFromText } from "@/lib/ai";

const WORD_LIMIT = 36;
const CHAR_LIMIT = 200;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title : "";
    const description = typeof body.description === "string" ? body.description : "";
    const source = `${title}\n\n${description}`.trim();

    if (!source) {
      return NextResponse.json({ summary: "" });
    }

    const generated = await generateSummaryFromText(source, WORD_LIMIT, CHAR_LIMIT);
    const summary = generated ?? fallbackSummary(description || title, CHAR_LIMIT) ?? "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Failed to summarize proposal", error);
    return NextResponse.json({ summary: "" }, { status: 200 });
  }
}
