"use client";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/ProposalAccordion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { castVote } from "@/app/actions/proposals";
import { ProposalDiscussionSheet } from "@/components/proposal-discussion-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTranslations } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Proposal {
    id: string;
    title: string;
    description: string | null;
    summary?: string | null;
    authorId: string;
    createdAt: Date | null;
    upvotes: number;
    downvotes: number;
    currentUserVote?: number | null;
    authorAvatarUrl?: string | null;
}

interface Comment {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date | null;
    proposalId: string;
    authorAvatarUrl?: string | null;
}

interface ProposalListProps {
    proposals: Proposal[];
    comments: Comment[];
    projectId: string;
    currentUserEmail?: string;
    locale?: Locale;
}

export function ProposalList({ proposals, comments, projectId, currentUserEmail, locale }: ProposalListProps) {
    const handleVote = async (proposalId: string, value: number) => {
        await castVote(proposalId, value, projectId);
    };
    const { t } = getTranslations(locale);

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {proposals.map((proposal) => {
                const proposalComments = comments.filter(c => c.proposalId === proposal.id);

                return (
                    <AccordionItem
                        key={proposal.id}
                        value={proposal.id}
                        className="border border-border/70 rounded-2xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <AccordionTrigger
                            upvotes={proposal.upvotes}
                            downvotes={proposal.downvotes}
                            commentCount={proposalComments.length}
                            createdAt={proposal.createdAt}
                        >
                            <MarkdownRenderer content={proposal.title} simple className="prose-headings:m-0 prose-p:m-0 inline" />
                        </AccordionTrigger>

                        <AccordionContent className="bg-muted/40 p-6">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-wrap justify-between items-start text-sm text-muted-foreground gap-3">
                                    <span className="flex items-center gap-2 text-foreground">
                                        <Avatar className="h-8 w-8 border border-border/70">
                                            <AvatarImage src={proposal.authorAvatarUrl || ""} />
                                            <AvatarFallback>{(proposal.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {proposal.authorId}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {t("proposal.upDown", { up: proposal.upvotes, down: proposal.downvotes })}
                                        </span>
                                    </div>
                                </div>

                                <div className="prose-sm max-w-none text-slate-700 dark:text-slate-200 leading-relaxed">
                                    <MarkdownRenderer content={proposal.summary || proposal.description || t("proposalList.noDescription")} />
                                </div>

                            <div className="flex flex-wrap justify-between items-center mt-4 gap-3 pt-1">
                                <div className="flex rounded-md overflow-hidden border border-border/70 bg-secondary">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={cn(
                                            "h-9 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200 shadow-sm cursor-pointer rounded-none border-r border-border/60",
                                            proposal.currentUserVote === 1 && "bg-green-50 text-green-700 ring-1 ring-green-300",
                                        )}
                                        onClick={() => handleVote(proposal.id, 1)}
                                        aria-label={t("proposalForm.upvote")}
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={cn(
                                            "h-9 px-3 gap-2 bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 shadow-sm cursor-pointer rounded-none",
                                            proposal.currentUserVote === -1 && "bg-rose-50 text-rose-700 ring-1 ring-rose-300",
                                        )}
                                        onClick={() => handleVote(proposal.id, -1)}
                                        aria-label={t("proposalForm.downvote")}
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <ProposalDiscussionSheet
                                        proposalId={proposal.id}
                                        projectId={projectId}
                                        proposalTitle={proposal.title}
                                        comments={proposalComments}
                                        currentUserEmail={currentUserEmail}
                                        label={t("proposalList.comments")}
                                    />
                                </div>
                            </div>
                                </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
