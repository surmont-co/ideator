import { completeWithFallback } from "@/lib/llm";

const defaultLocale = process.env.LOCALE || "en";

const systemPrompt = (maxWords: number, maxChars?: number) => {
    const charConstraint = maxChars ? ` and at most ${maxChars} characters` : "";
    return [
        `You are summarizing a project or proposal.`,
        `Respond ONLY in the "${defaultLocale}" language (translate if needed), using correct diacritics for that locale.`,
        `Assume the reader already sees the project title separately; do not repeat or rephrase the title or proper names unless essential to meaning.`,
        `Write a single crisp sentence with no bullets or headings, removing redundancy and filler.`,
        `Keep it easy to read and remember.`,
        `Use at most ${maxWords} words${charConstraint}.`,
    ].join(" ");
};

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };

export async function generateSummaryFromText(input: string, maxWords = 60, maxChars?: number): Promise<string | null> {
    if (!input.trim()) {
        return null;
    }

    try {
        const prompt = `${systemPrompt(maxWords, maxChars)}\n\n${input}`;
        const { text } = await completeWithFallback(prompt, {
            maxTokens: 180,
            temperature: 0.4,
            topP: 0.9,
        });
        if (!text) return null;
        if (maxChars) return text.slice(0, maxChars);
        return text.slice(0, 480);
    } catch {
        return null;
    }
}

export function fallbackSummary(text: string | null | undefined, maxChars = 240): string | null {
    if (!text) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (trimmed.length <= maxChars) return trimmed;
    return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}
