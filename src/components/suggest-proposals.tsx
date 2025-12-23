"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ThumbsDown, ThumbsUp, X, Eye } from "lucide-react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type ExistingProposal = { title: string; description?: string | null; summary?: string | null };

type SuggestedProposal = {
  id: string;
  title: string;
  summary: string;
  details: string;
};

type Props = {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  existing: ExistingProposal[];
  locale?: Locale;
};

export function SuggestProposalsButton({
  projectId,
  projectTitle,
  projectDescription,
  existing,
  locale,
}: Props) {
  const { t } = getTranslations(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, startLoading] = useTransition();
  const [suggestions, setSuggestions] = useState<SuggestedProposal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SuggestedProposal | null>(null);
  const [votes, setVotes] = useState<Record<string, 1 | -1 | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const hasSelection = Object.values(votes).some((v) => v === 1 || v === -1);

  const generate = () => {
    setOpen(true);
    setError(null);
    setSuggestions([]);
    setVotes({});
    startLoading(async () => {
      try {
        const res = await fetch("/api/proposals/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            project: { title: projectTitle, description: projectDescription },
            proposals: existing,
          }),
        });
        type SuggestResponse = { proposals?: { title?: unknown; summary?: unknown; details?: unknown }[]; error?: string };
        const data = (await res.json()) as SuggestResponse;
        const items: SuggestedProposal[] = (data.proposals || []).map((p, idx) => ({
          id: `${idx}-${p.title || "proposal"}`,
          title: String(p.title || "").trim(),
          summary: String(p.summary || p.details || "").trim(),
          details: String(p.details || "").trim(),
        }));
        setSuggestions(items);
        if (!items.length) setError(data.error || t("suggestions.none"));
      } catch (err) {
        console.error(err);
        setError(t("suggestions.error"));
      }
    });
  };

  const handleVote = (id: string, value: 1 | -1) => {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === value ? undefined : value }));
  };

  const handleSubmit = async () => {
    if (!hasSelection) return;
    setSubmitting(true);
    try {
      const payload = suggestions
        .filter((s) => votes[s.id] === 1 || votes[s.id] === -1)
        .map((s) => ({
          title: s.title,
          details: s.details,
          summary: s.summary,
          vote: votes[s.id],
        }));
      const res = await fetch("/api/proposals/submit-suggested", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, proposals: payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("suggestions.error"));
        return;
      }
      router.refresh();
      setOpen(false);
      setDetail(null);
      setVotes({});
      setSuggestions([]);
      const input = document.getElementById("proposal-title") as HTMLInputElement | null;
      input?.focus();
    } catch (err) {
      console.error(err);
      setError(t("suggestions.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="h-10 px-3 gap-2" onClick={generate}>
        <Sparkles className="w-4 h-4" />
        {t("suggestions.cta")}
      </Button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <Card className="relative z-50 w-[min(92vw,760px)] max-h-[80vh] overflow-hidden border border-border/70 bg-card shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/70">
              <div>
                <p className="text-sm font-semibold">{t("suggestions.title")}</p>
                <p className="text-xs text-muted-foreground">{t("suggestions.subtitle")}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-14">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("suggestions.generating")}</span>
              </div>
            ) : (
              <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
                {error && <p className="text-sm text-amber-700">{error}</p>}
                {suggestions.length === 0 && !error && (
                  <p className="text-sm text-muted-foreground">{t("suggestions.none")}</p>
                )}
                {suggestions.map((item) => {
                  const vote = votes[item.id];
                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-lg border border-border/60 bg-muted/40 p-4 space-y-2 shadow-sm overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.summary || t("suggestions.noSummary")}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "absolute top-3 right-3 transition-opacity",
                        vote ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <div className="flex rounded-md overflow-hidden border border-border/70 bg-secondary">
                          <Button
                            variant="secondary"
                            size="sm"
                            className={cn(
                              "h-8 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                              vote === 1 && "bg-green-50 text-green-700 ring-1 ring-green-300"
                            )}
                            onClick={() => handleVote(item.id, 1)}
                            aria-label={t("proposalForm.upvote")}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={cn(
                              "h-8 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                              vote === -1 && "bg-rose-50 text-rose-700 ring-1 ring-rose-300"
                            )}
                            onClick={() => handleVote(item.id, -1)}
                            aria-label={t("proposalForm.downvote")}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary shadow-sm cursor-pointer rounded-none"
                            onClick={() => setDetail(item)}
                            aria-label={t("suggestions.viewDetails")}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">{t("suggestions.viewDetails")}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border/70">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("suggestions.cancel")}
              </Button>
              <Button disabled={!hasSelection || submitting} onClick={handleSubmit}>
                {submitting ? t("suggestions.submitting") : t("suggestions.addSelected")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetail(null)} />
          <Card className="relative z-60 w-[min(88vw,640px)] max-h-[70vh] overflow-hidden border border-border/70 bg-card shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/70">
              <p className="font-semibold">{detail.title}</p>
              <Button variant="ghost" size="icon" onClick={() => setDetail(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[50vh] space-y-3">
              <MarkdownRenderer content={detail.details} className="prose-sm max-w-none text-foreground" />
            </div>
            <div className="flex items-center gap-2 px-5 py-4 border-t border-border/70">
              <div className="flex rounded-md overflow-hidden border border-border/70 bg-secondary">
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "h-9 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                    votes[detail.id] === 1 && "bg-green-50 text-green-700 ring-1 ring-green-300"
                  )}
                  onClick={() => handleVote(detail.id, 1)}
                  aria-label={t("proposalForm.upvote")}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "h-9 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-sm cursor-pointer rounded-none",
                    votes[detail.id] === -1 && "bg-rose-50 text-rose-700 ring-1 ring-rose-300"
                  )}
                  onClick={() => handleVote(detail.id, -1)}
                  aria-label={t("proposalForm.downvote")}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="ml-auto">
                <Button variant="ghost" onClick={() => setDetail(null)}>
                  {t("suggestions.close")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
