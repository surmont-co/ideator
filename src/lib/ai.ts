const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent";

const defaultLocale = process.env.LOCALE || "en";

const systemPrompt = (maxWords: number) =>
    `Summarize the following project or proposal in at most ${maxWords} words. Keep it concise, neutral, and informative. Avoid markdown headings, emojis, or bullet lists. Return a single paragraph of plain text in the locale "${defaultLocale}".`;

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };

export async function generateSummaryFromText(input: string, maxWords = 60): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !input.trim()) {
        return null;
    }

    try {
        const prompt = `${systemPrompt(maxWords)}\n\n${input}`;
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 180,
                    temperature: 0.4,
                    topP: 0.9,
                },
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as { candidates?: GeminiCandidate[] };
        const text = data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text ?? "")
            .join("")
            .trim();

        if (!text) {
            return null;
        }

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
