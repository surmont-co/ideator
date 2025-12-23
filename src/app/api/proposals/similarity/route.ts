import { NextResponse } from "next/server";

import { completeWithFallback } from "@/lib/llm";

const defaultLocale = process.env.LOCALE || "en";

type IncomingProposal = { id: string; title: string; description?: string | null; summary?: string | null };
type SimilarResult = { id: string; similarity: number; explanation: string };
type ProjectContext = { title: string; description?: string | null };

function extractJson(text: string): SimilarResult[] {
  const toResult = (id: string, val: unknown): SimilarResult => {
    const obj = typeof val === "object" && val !== null ? (val as Record<string, unknown>) : {};
    const similarity = Number(obj.similarity ?? 0);
    const explanation = typeof obj.explanation === "string" ? obj.explanation : "";
    return { id, similarity, explanation };
  };

  try {
    const direct = JSON.parse(text);
    if (Array.isArray(direct)) return direct as SimilarResult[];
    if (direct && typeof direct === "object") {
      return Object.entries(direct).map(([id, val]) => toResult(id, val));
    }
  } catch {
    // ignore
  }
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed as SimilarResult[];
    } catch {
      return [];
    }
  }
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed && typeof parsed === "object") {
        return Object.entries(parsed).map(([id, val]) => toResult(id, val));
      }
    } catch {
      // ignore and fall through
    }
  }
  // Regex extraction fallback when JSON is malformed/truncated
  const regex = /"([^"]+)":\s*\{\s*"similarity"\s*:\s*(\d+(?:\.\d+)?)[^}]*?"explanation"\s*:\s*"([^"]*)"/g;
  const results: SimilarResult[] = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    results.push({
      id: m[1] ?? "",
      similarity: Number(m[2] ?? 0),
      explanation: m[3] ?? "",
    });
  }
  return results;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ăâîșț ]/gi, " ");
}

function tokenize(text: string) {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function simpleSimilarity(a: string, b: string) {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const inter = [...tokensA].filter((t) => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return (inter / union) * 100;
}

function fallbackSimilarities(existing: IncomingProposal[], proposal: IncomingProposal, locale: string) {
  const base = `${proposal.title} ${proposal.description || ""}`.trim();
  return existing.map((p) => {
    const target = `${p.title} ${p.description || ""}`.trim();
    const similarity = Math.round(simpleSimilarity(base, target));
    const explanation = locale.toLowerCase().startsWith("ro")
      ? "Conținut similar identificat pe cuvinte cheie."
      : "Similar content based on shared keywords.";
    return { id: p.id, similarity, explanation };
  });
}

export async function POST(request: Request) {
  let existing: IncomingProposal[] = [];
  let proposal: IncomingProposal = { id: "new", title: "", description: "" };
  let project: ProjectContext = { title: "", description: "" };

  try {
    const body = await request.json();
    existing = Array.isArray(body.existing) ? body.existing : [];
    proposal = body.proposal || proposal;
    project = body.project || project;

    const payload = {
      existing: existing.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || "",
        summary: p.summary || "",
      })),
      proposal: {
        id: proposal.id || "new",
        title: proposal.title || "",
        description: proposal.description || "",
      },
    };

    const systemPrompt = [
      `We have a project and a list of existing proposals for it.`,
      `Return a JSON object where each key is an existing proposal ID and value is { "similarity": 0-100, "explanation": "<human, concise reason in ${defaultLocale}> }.`,
      `Compare each existing proposal one-to-one against the NEW proposal provided.`,
      `Use the project context to understand intent and avoid keyword-only reasoning.`,
      `Be specific (e.g., overlapping KPIs, duplicate features, same outcomes).`,
      `Respond ONLY with valid JSON, no prose, no code fences.`,
    ].join(" ");

    const prompt = `${systemPrompt}

Project:
${JSON.stringify(project)}

Existing proposals (JSON map by id):
${JSON.stringify(payload.existing, null, 2)}

New proposal:
${JSON.stringify(payload.proposal, null, 2)}`;

    const { text, modelUsed } = await completeWithFallback(prompt, {
      maxTokens: 320,
      temperature: 0.2,
      topP: 0.8,
    });

    console.info("[similarity_ai_request]", {
      locale: defaultLocale,
      projectTitle: project.title,
      existingCount: existing.length,
      proposalTitle: proposal.title,
      modelUsed,
      promptPreview: prompt.slice(0, 4000),
    });

    if (!text) {
      const fallback = fallbackSimilarities(existing, payload.proposal, defaultLocale);
      return NextResponse.json({ matches: fallback });
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[similarity_ai_response]", {
        locale: defaultLocale,
        projectTitle: project.title,
        proposalTitle: proposal.title,
        modelUsed,
        raw: text.slice(0, 4000),
      });
    }

    const parsed = extractJson(text);

    const baseMap = new Map(existing.map((p) => [p.id, p.title]));
    const matches = parsed
      .filter((m) => typeof m?.id === "string")
      .map((m) => ({
        id: m.id,
        similarity: Math.max(0, Math.min(100, Number(m.similarity) || 0)),
        explanation: typeof m.explanation === "string" ? m.explanation : "",
      }))
      .filter((m) => baseMap.has(m.id));

    // Ensure every existing proposal is represented, even if AI omitted it.
    const completed = existing.map((p) => {
      const found = matches.find((m) => m.id === p.id);
      if (found) return found;
      return {
        id: p.id,
        similarity: 0,
        explanation: defaultLocale.toLowerCase().startsWith("ro")
          ? "Nu a fost identificată o suprapunere clară."
          : "No clear overlap identified.",
      };
    });

    const finalMatches = completed.length ? completed : fallbackSimilarities(existing, payload.proposal, defaultLocale);
    console.info("[similarity_ai_parsed]", {
      locale: defaultLocale,
      projectTitle: project.title,
      proposalTitle: proposal.title,
      matches: finalMatches,
    });
    return NextResponse.json({ matches: finalMatches });
  } catch (error) {
    console.error("AI similarity check failed", error);
    return NextResponse.json({ matches: fallbackSimilarities(existing, proposal, defaultLocale) });
  }
}
