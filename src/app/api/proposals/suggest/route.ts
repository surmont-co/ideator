import { NextResponse } from "next/server";
import { completeWithFallback } from "@/lib/llm";

type SuggestRequest = {
  project: { title: string; description?: string | null };
  proposals?: { title: string; description?: string | null; summary?: string | null }[];
  locale?: string;
};

type SuggestedProposal = {
  title: string;
  details: string;
  summary: string;
};

function buildPrompt({ project, proposals = [], locale = "en" }: SuggestRequest) {
  const existing = proposals
    .map((p, idx) => `${idx + 1}. ${p.title} — ${p.description || p.summary || ""}`)
    .join("\n");

  return [
    `You are helping a team brainstorm NEW proposals for a project.`,
    `Respond ONLY in ${locale} (app locale from LOCALE env) with JSON array of up to 3 objects, each having "title", "details", and "summary".`,
    `Write "details" in structured Markdown with clear sections (use ## headings) and concise bullet lists/sub-lists for implementation notes/steps; provide enough context to act on the idea.`,
    `Each summary must be at most 240 characters. Do not number or bullet inside values.`,
    `Avoid duplicating or rephrasing existing proposals; skip anything that is too close.`,
    `Project title: ${project.title}`,
    `Project description: ${project.description || "(none)"}`,
    `Existing proposals (avoid similar):`,
    existing || "none",
    `Return JSON like: [{"title":"...","details":"...","summary":"..."}]`,
  ].join("\n\n");
}

function tryParseSuggestions(text: string | null): SuggestedProposal[] {
  if (!text) return [];
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const candidate = jsonMatch ? jsonMatch[0] : text;
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({
          title: String(item.title || "").trim(),
          details: String(item.details || item.description || "").trim(),
          summary: String(item.summary || "").trim(),
        }))
        .filter((p) => p.title && p.details && p.summary)
        .slice(0, 3);
    }
  } catch {
    // ignore
  }
  return [];
}

export async function POST(req: Request) {
  const body = (await req.json()) as SuggestRequest;
  if (!body?.project?.title) {
    return NextResponse.json({ error: "Missing project data" }, { status: 400 });
  }

  const prompt = buildPrompt(body);
  const { text } = await completeWithFallback(prompt, { maxTokens: 600, temperature: 0.65 });
  const suggestions = tryParseSuggestions(text);

  if (suggestions.length === 0) {
    return NextResponse.json({ proposals: [], error: "No suggestions" }, { status: 200 });
  }

  return NextResponse.json({ proposals: suggestions });
}
