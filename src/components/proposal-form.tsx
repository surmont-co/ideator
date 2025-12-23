"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createProposal } from "@/app/actions/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
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
    similarity: number;
    explanation: string;
    userVote?: number | null;
};

export function ProposalForm({
    projectId,
    locale,
    existingProposals = [],
    projectTitle,
    projectDescription,
}: {
    projectId: string;
    locale?: Locale;
    existingProposals?: ExistingProposal[];
    projectTitle: string;
    projectDescription: string;
}) {
    const [state, action, isPending] = useActionState(createProposal, null);
    const [vote, setVote] = useState<"1" | "-1">("1");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);
    const [showSimilarModal, setShowSimilarModal] = useState(false);
    const [bypassSimilarity, setBypassSimilarity] = useState(false);
    const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
    const [isVotingSimilar, setIsVotingSimilar] = useState(false);
    const [similarityError, setSimilarityError] = useState<string | null>(null);
    const voteLookup = useMemo(
        () => new Map(existingProposals.map((p) => [p.id, p.userVote ?? null])),
        [existingProposals],
    );
    const formRef = useRef<HTMLFormElement>(null);
    const { t } = getTranslations(locale);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focusIfHash = () => {
            if (typeof window === "undefined") return;
            if (window.location.hash === "#proposal-title") {
                titleRef.current?.focus();
            }
        };
        focusIfHash();
        window.addEventListener("hashchange", focusIfHash);
        return () => {
            window.removeEventListener("hashchange", focusIfHash);
        };
    }, []);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            // Reset to neutral positive vote after submission to keep the CTA stable.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVote("1");
            setTitle("");
            setDescription("");
            setSimilarMatches([]);
            setShowSimilarModal(false);
            setBypassSimilarity(false);
        }
    }, [state?.success]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        if (bypassSimilarity) {
            // Allow the native/action submit to proceed without re-checking.
            setBypassSimilarity(false);
            return;
        }
        if (isPending || isCheckingSimilarity) {
            event.preventDefault();
            return;
        }
        event.preventDefault();
        setIsCheckingSimilarity(true);
        setShowSimilarModal(false);
        setSimilarMatches([]);
        setSimilarityError(null);
        try {
            const res = await fetch("/api/proposals/similarity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proposal: { title, description },
                    existing: existingProposals.map((p) => ({
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        summary: p.summary,
                    })),
                    project: { title: projectTitle, description: projectDescription },
                }),
            });
            const data = (await res.json()) as { matches?: { id: string; similarity: number; explanation?: string }[] };
            if (process.env.NODE_ENV === "development") {
                // Helpful for debugging AI outputs in the browser console.
                // eslint-disable-next-line no-console
                console.info("[similarity_client_response]", data);
            }
            const matches = (data.matches || [])
                .map((m) => {
                    const ref = existingProposals.find((p) => p.id === m.id);
                    const userVote = voteLookup.get(m.id) ?? ref?.userVote ?? null;
                    return {
                        id: m.id,
                        title: ref?.title || m.id,
                        similarity: m.similarity,
                        explanation: m.explanation || "",
                        userVote,
                    };
                })
                .filter((m) => m.similarity > 0)
                .sort((a, b) => b.similarity - a.similarity);

            if (matches.length === 0) {
                setBypassSimilarity(true);
                formRef.current?.requestSubmit();
                return;
            }

            setSimilarMatches(matches);
            setShowSimilarModal(true);
        } catch (error) {
            console.error("Similarity check failed", error);
            setSimilarityError(t("proposalForm.checkingSimilarity"));
            setShowSimilarModal(true);
        } finally {
            setIsCheckingSimilarity(false);
        }
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

    const disableSubmit = isPending || isCheckingSimilarity;
    const showSimilarityWarning = similarMatches.length > 0 && !bypassSimilarity;

    return (
        <Card className="border-border/80 shadow-md rounded-2xl bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">{t("proposalForm.submit")}</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-5 relative">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="initialVote" value={vote} />

                    <div className="space-y-2">
                        <Input
                            id="proposal-title"
                            ref={titleRef}
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
                        <div className="flex rounded-md overflow-hidden border border-border/70 bg-secondary">
                            <Button
                                type="button"
                                variant="secondary"
                                className={cn(
                                    "gap-2 h-9 px-4 bg-secondary text-secondary-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                                    vote === "1" && "bg-green-50 text-green-700 ring-1 ring-green-300",
                                )}
                                onClick={() => setVote("1")}
                                aria-label={t("proposalForm.upvote")}
                            >
                                <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className={cn(
                                    "gap-2 h-9 px-4 bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-sm cursor-pointer rounded-none",
                                    vote === "-1" && "bg-rose-50 text-rose-700 ring-1 ring-rose-300",
                                )}
                                onClick={() => setVote("-1")}
                                aria-label={t("proposalForm.downvote")}
                            >
                                <ThumbsDown className="w-4 h-4" />
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
                        <div className="fixed inset-0 z-20 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSimilarModal(false)} />
                            <div className="relative z-30 w-[min(90vw,720px)] rounded-2xl border border-border bg-card shadow-xl p-6 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">{t("proposalForm.similarTitle")}</h3>
                                    <p className="text-sm text-muted-foreground">{t("proposalForm.similarSubtitle")}</p>
                                </div>
                                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                                    {similarMatches.map((match) => {
                                        const pct = Math.max(0, Math.min(100, Math.round(match.similarity)));
                                        const userVote = voteLookup.get(match.id) ?? match.userVote ?? null;
                                        return (
                                            <div
                                                key={match.id}
                                                className={cn(
                                                    "group relative rounded-lg border border-border/70 bg-muted/40 p-3 transition hover:border-primary/60 hover:bg-primary/5 overflow-hidden",
                                                    isVotingSimilar && "opacity-70",
                                                )}
                                            >
                                                <div
                                                    className="absolute inset-0 opacity-30 pointer-events-none"
                                                    aria-hidden
                                                    style={{
                                                        background: `linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.25) ${pct}%, transparent ${pct}%)`,
                                                    }}
                                                />
                                                <div className="relative flex items-start gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="font-semibold text-sm">{match.title}</div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {match.explanation && <span className="leading-relaxed">{match.explanation}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex rounded-md overflow-hidden border border-border/70 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleVoteSimilar(match.id, 1)}
                                                            disabled={isVotingSimilar}
                                                            className={cn(
                                                                "h-9 px-3 bg-secondary text-secondary-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                                                                userVote === 1 && "bg-green-50 text-green-700 ring-1 ring-green-300",
                                                            )}
                                                            aria-label={t("proposalForm.upvote")}
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleVoteSimilar(match.id, -1)}
                                                            disabled={isVotingSimilar}
                                                            className={cn(
                                                                "h-9 px-3 bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700 hover-border-rose-200 shadow-sm cursor-pointer rounded-none",
                                                                userVote === -1 && "bg-rose-50 text-rose-700 ring-1 ring-rose-300",
                                                            )}
                                                            aria-label={t("proposalForm.downvote")}
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {similarMatches.length === 0 && similarityError && (
                                        <div className="text-sm text-muted-foreground">{similarityError}</div>
                                    )}
                                </div>
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

                    {isCheckingSimilarity && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="rounded-2xl bg-card border border-border shadow-xl px-6 py-5 flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                <div className="text-sm text-muted-foreground">
                                    {t("proposalForm.analyzing")}
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
