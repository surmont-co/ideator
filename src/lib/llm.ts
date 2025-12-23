const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const OPENAI_MODEL = process.env.OPENAI_MODEL;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

type LLMOptions = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
};

type LLMResult = {
  text: string | null;
  status?: number;
  error?: unknown;
};

const throttleUntil: Record<string, number> = {};
const FIFTEEN_MIN_MS = 15 * 60 * 1000;

function isThrottled(modelKey: string) {
  const until = throttleUntil[modelKey];
  return typeof until === "number" && until > Date.now();
}

function throttle(modelKey: string) {
  throttleUntil[modelKey] = Date.now() + FIFTEEN_MIN_MS;
}

async function callGemini(prompt: string, opts: LLMOptions): Promise<LLMResult> {
  if (!GEMINI_KEY) return { text: null };
  if (isThrottled("gemini")) return { text: null, status: 429 };
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 320,
          temperature: opts.temperature ?? 0.4,
          topP: opts.topP ?? 0.9,
        },
      }),
    });

    if (!response.ok) {
      throttle("gemini");
      return { text: null, status: response.status };
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("")?.trim() ?? null;
    return { text };
  } catch (error) {
    return { text: null, error };
  }
}

async function callOpenAI(prompt: string, opts: LLMOptions): Promise<LLMResult> {
  if (!OPENAI_KEY || !OPENAI_MODEL) return { text: null };
  if (isThrottled("openai")) return { text: null, status: 429 };
  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: opts.maxTokens ?? 320,
        temperature: opts.temperature ?? 0.4,
        top_p: opts.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      throttle("openai");
      return { text: null, status: response.status };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? null;
    return { text };
  } catch (error) {
    return { text: null, error };
  }
}

export async function completeWithFallback(
  prompt: string,
  opts: LLMOptions = {},
): Promise<{ text: string | null; modelUsed: string | null }> {
  const candidates: { key: string; fn: (p: string, o: LLMOptions) => Promise<LLMResult> }[] = [
    { key: "gemini", fn: callGemini },
    { key: "openai", fn: callOpenAI },
  ].filter((c) => (c.key === "gemini" ? !!GEMINI_KEY : !!OPENAI_KEY && !!OPENAI_MODEL));

  for (const candidate of candidates) {
    const result = await candidate.fn(prompt, opts);
    if (result.status === 429) {
      // Already throttled; move to next provider.
      continue;
    }
    if (result.text) {
      return { text: result.text, modelUsed: candidate.key };
    }
  }

  return { text: null, modelUsed: null };
}
