"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createProposal } from "@/app/actions/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import * as React from "react";
import { getTranslations, type Locale } from "@/lib/i18n";

export function ProposalForm({ projectId, locale }: { projectId: string; locale?: Locale }) {
    const [state, action, isPending] = useActionState(createProposal, null);
    const [vote, setVote] = useState<"1" | "-1">("1");
    const formRef = useRef<HTMLFormElement>(null);
    const { t } = getTranslations(locale);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            // Reset to neutral positive vote after submission to keep the CTA stable.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVote("1");
        }
    }, [state?.success]);

    return (
        <Card className="border-border/80 shadow-md rounded-2xl bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Add New Proposal</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={action} className="space-y-5">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="initialVote" value={vote} />

                    <div className="space-y-2">
                        <Input
                            id="title"
                            name="title"
                            placeholder={t("proposalForm.title")}
                            required
                            minLength={5}
                            className="h-11"
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
                        <Button type="submit" className="h-11 px-5 text-base font-semibold" disabled={isPending}>
                            {isPending ? t("proposalForm.submitting") : t("proposalForm.submit")}
                        </Button>
                    </div>

                    {state?.error && (
                        <p className="text-red-600 text-sm text-center">{state.error}</p>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
