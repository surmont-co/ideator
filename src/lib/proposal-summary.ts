import { fallbackSummary, generateSummaryFromText } from "@/lib/ai";

const PROPOSAL_SUMMARY_WORD_LIMIT = 42;
const PROPOSAL_SUMMARY_CHAR_LIMIT = 260;

export async function buildProposalSummary(title: string, description: string | null | undefined) {
  const promptSource = [
    "Provide a concise explanation of what this proposal aims to do and why it matters.",
    "Assume the title is shown separately; do not restate or paraphrase it.",
    `Title: ${title}`,
    `Description:\n${description ?? ""}`,
  ].join("\n\n");

  const generated = await generateSummaryFromText(
    promptSource,
    PROPOSAL_SUMMARY_WORD_LIMIT,
    PROPOSAL_SUMMARY_CHAR_LIMIT,
  );

  const summary =
    fallbackSummary(generated, PROPOSAL_SUMMARY_CHAR_LIMIT) ??
    fallbackSummary(description || title, PROPOSAL_SUMMARY_CHAR_LIMIT);

  return summary || null;
}
