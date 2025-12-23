"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createProposal } from "@/app/actions/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import * as React from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { castVote } from "@/app/actions/proposals";

type ExistingProposal = {
    id: string;
    title: string;
    description: string | null;
    summary: string | null;
    userVote?: number | null;
};

type SimilarMatch = {
    id: string;
    title: string;
    score: number;
    reason: string;
};

const SIMILARITY_THRESHOLD = 0.4;
const SUMMARY_MAX_CHARS = 200;

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

function jaccardScore(tokensA: string[], tokensB: string[]) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = [...setA].filter((t) => setB.has(t));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.length / union.size;
}

function trigrams(text: string) {
    const cleaned = normalize(text).replace(/\s+/g, " ").trim();
    const grams: string[] = [];
    for (let i = 0; i < cleaned.length - 2; i += 1) {
        grams.push(cleaned.slice(i, i + 3));
    }
    return grams;
}

function diceCoefficient(a: string[], b: string[]) {
    if (a.length === 0 || b.length === 0) return 0;
    const setB = new Set(b);
    const intersection = a.filter((g) => setB.has(g)).length;
    return (2 * intersection) / (a.length + b.length);
}

function overlapRatio(a: string, b: string) {
    if (!a || !b) return 0;
    if (a.includes(b)) return b.length / Math.max(a.length, b.length);
    if (b.includes(a)) return a.length / Math.max(a.length, b.length);
    return 0;
}

function tokenSimilarityScore(tokensA: string[], tokensB: string[]) {
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    const bestMatches = tokensA.map((tokenA) => {
        let best = 0;
        for (const tokenB of tokensB) {
            const ratio = overlapRatio(tokenA, tokenB);
            if (ratio > best) best = ratio;
        }
        return best;
    });
    return bestMatches.reduce((sum, v) => sum + v, 0) / tokensA.length;
}

export function ProposalForm({
    projectId,
    locale,
    existingProposals = [],
}: {
    projectId: string;
    locale?: Locale;
    existingProposals?: ExistingProposal[];
}) {
    const [state, action, isPending] = useActionState(createProposal, null);
    const [vote, setVote] = useState<"1" | "-1">("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [generatedSummary, setGeneratedSummary] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);
    const [showSimilarModal, setShowSimilarModal] = useState(false);
    const [bypassSimilarity, setBypassSimilarity] = useState(false);
    const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
    const [isVotingSimilar, setIsVotingSimilar] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { t } = getTranslations(locale);

    const existingTokens = useMemo(() => {
        return existingProposals.map((p) => {
            const text = `${p.title} ${p.description || ""} ${p.summary || ""}`;
            const tokens = tokenize(text);
            const grams = trigrams(text);
            return { ...p, tokens, grams, fullText: text };
        });
    }, [existingProposals]);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            // Reset to neutral positive vote after submission to keep the CTA stable.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVote("1");
            setTitle("");
            setDescription("");
            setGeneratedSummary("");
            setSimilarMatches([]);
            setShowSimilarModal(false);
            setBypassSimilarity(false);
        }
    }, [state?.success]);

    // Similarity checking while typing (debounced by 250ms).
    useEffect(() => {
        const inputText = `${title} ${description}`.trim();
        if (!inputText) {
            setSimilarMatches([]);
            return;
        }
        setIsCheckingSimilarity(true);
        const timer = window.setTimeout(() => {
            const tokens = tokenize(inputText);
            const grams = trigrams(inputText);
            const candidates = existingTokens
                .map((p) => {
                    const tokenScore = jaccardScore(tokens, p.tokens);
                    const gramScore = diceCoefficient(grams, p.grams);
                    const fuzzyTokenScore = tokenSimilarityScore(tokens, p.tokens);
                    const score = Math.max(tokenScore, gramScore, fuzzyTokenScore);
                    const sharedTokens = [...new Set(tokens.filter((t) => p.tokens.includes(t)))].slice(0, 6);
                    const reason =
                        sharedTokens.length > 0
                            ? `Cuvinte comune: ${sharedTokens.join(", ")}`
                            : fuzzyTokenScore >= SIMILARITY_THRESHOLD
                                ? "Conținut foarte similar"
                                : gramScore >= SIMILARITY_THRESHOLD
                                    ? "Formulare similară"
                                    : "";
                    return {
                        id: p.id,
                        title: p.title,
                        score,
                        reason,
                    };
                })
                .filter((c) => c.score >= SIMILARITY_THRESHOLD)
                .sort((a, b) => b.score - a.score);
            setSimilarMatches(candidates);
            setIsCheckingSimilarity(false);
            setBypassSimilarity(false);
        }, 250);
        return () => window.clearTimeout(timer);
    }, [title, description, existingTokens]);

    // Generate summary while typing.
    useEffect(() => {
        const source = `${title}\n\n${description}`.trim();
        if (!source) {
            setGeneratedSummary("");
            return;
        }
        setIsSummarizing(true);
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const res = await fetch("/api/proposals/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, description }),
                    signal: controller.signal,
                });
                const data = (await res.json()) as { summary?: string };
                setGeneratedSummary((data.summary || "").slice(0, SUMMARY_MAX_CHARS));
            } catch {
                setGeneratedSummary(source.slice(0, SUMMARY_MAX_CHARS));
            } finally {
                setIsSummarizing(false);
            }
        }, 300);
        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [title, description]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (isPending || isSummarizing || isCheckingSimilarity) {
            event.preventDefault();
            return;
        }
        if (!bypassSimilarity && similarMatches.length > 0) {
            event.preventDefault();
            setShowSimilarModal(true);
            return;
        }
        setBypassSimilarity(false);
    };

    const confirmSubmit = () => {
        setShowSimilarModal(false);
        setBypassSimilarity(true);
        formRef.current?.requestSubmit();
    };

    const handleVoteSimilar = async (proposalId: string, value: number) => {
        if (isVotingSimilar) return;
        try {
            setIsVotingSimilar(true);
            await castVote(proposalId, value, projectId);
            setShowSimilarModal(false);
        } finally {
            setIsVotingSimilar(false);
        }
    };

    const disableSubmit = isPending || isSummarizing || isCheckingSimilarity;
    const showSimilarityWarning = similarMatches.length > 0 && !bypassSimilarity;

    return (
        <Card className="border-border/80 shadow-md rounded-2xl bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Add New Proposal</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-5 relative">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="initialVote" value={vote} />
                    <input type="hidden" name="summary" value={generatedSummary} />

                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            placeholder={t("proposalForm.title")}
                            required
                            minLength={5}
                            className="h-11"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {state?.issues?.title && (
                            <p className="text-red-500 text-sm">{state.issues.title[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Textarea
                            id="description"
                            name="description"
                            placeholder={t("proposalForm.description")}
                            className="min-h-[140px] leading-relaxed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className={`gap-2 h-10 px-3 ${vote === "1" ? "border-primary text-primary" : ""}`}
                                onClick={() => setVote("1")}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {t("proposalForm.upvote")}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className={`gap-2 h-10 px-3 ${vote === "-1" ? "border-destructive text-destructive" : ""}`}
                                onClick={() => setVote("-1")}
                            >
                                <ThumbsDown className="w-4 h-4" />
                                {t("proposalForm.downvote")}
                            </Button>
                        </div>
                        <Button type="submit" className="h-11 px-5 text-base font-semibold" disabled={disableSubmit}>
                            {disableSubmit ? t("proposalForm.submitting") : t("proposalForm.submit")}
                        </Button>
                    </div>

                    {state?.error && (
                        <p className="text-red-600 text-sm text-center">{state.error}</p>
                    )}

                    {showSimilarityWarning && showSimilarModal && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSimilarModal(false)} />
                            <div className="relative z-30 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl p-6 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">{t("proposalForm.similarTitle")}</h3>
                                    <p className="text-sm text-muted-foreground">{t("proposalForm.similarSubtitle")}</p>
                                </div>
                                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                                    {similarMatches.map((match) => (
                                        <div
                                            key={match.id}
                                            className={cn(
                                                "group rounded-lg border border-border/70 bg-muted/40 p-3 transition hover:border-primary/60 hover:bg-primary/5",
                                                isVotingSimilar && "opacity-70",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-sm">{match.title}</div>
                                                    {match.reason && (
                                                        <div className="text-sm text-muted-foreground">{match.reason}</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleVoteSimilar(match.id, 1)}
                                                        disabled={isVotingSimilar}
                                                        className="h-10 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm"
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                        {t("proposalForm.upvote")}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleVoteSimilar(match.id, -1)}
                                                        disabled={isVotingSimilar}
                                                        className="h-10 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm"
                                                    >
                                                        <ThumbsDown className="w-4 h-4" />
                                                        {t("proposalForm.downvote")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {generatedSummary && (
                                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                                        <div className="text-xs uppercase font-semibold text-muted-foreground mb-1">
                                            {t("proposalForm.summaryPreview")}
                                        </div>
                                        <div className="text-sm">{generatedSummary}</div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" type="button" onClick={() => setShowSimilarModal(false)}>
                                        {t("proposalForm.cancel")}
                                    </Button>
                                    <Button type="button" onClick={confirmSubmit}>
                                        {t("proposalForm.submitAnyway")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
