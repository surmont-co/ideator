"use client";

import { useActionState, useEffect, useRef } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { addComment } from "@/app/actions/comments";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date | null;
    authorAvatarUrl?: string | null;
}

interface ProposalDiscussionSheetProps {
    proposalId: string;
    projectId: string; // Needed for revalidation
    proposalTitle: string;
    comments: Comment[];
    currentUserEmail?: string;
}

export function ProposalDiscussionSheet({
    proposalId,
    projectId,
    proposalTitle,
    comments,
    currentUserEmail,
}: ProposalDiscussionSheetProps) {
    const [state, action, isPending] = useActionState(addComment, null);
    const formRef = useRef<HTMLFormElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state?.success]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2 h-9 px-3 border border-border/70">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Comments</span>
                    <span className="bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-semibold text-foreground shadow-sm">{comments.length}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg p-0 gap-0 bg-card">
                <SheetHeader className="p-6 pb-3 border-b bg-card">
                    <SheetTitle className="line-clamp-2 text-left text-lg">{proposalTitle}</SheetTitle>
                    <SheetDescription className="text-left">
                        Discuss this proposal with the team and keep decisions visible.
                    </SheetDescription>
                </SheetHeader>

                <div className="relative flex-1">
                    <ScrollArea className="flex-1 p-6">
                        <div className="flex flex-col gap-6" ref={scrollRef}>
                            {comments.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-10">No comments yet. Start the discussion!</p>
                            )}
                            {comments.map((comment) => {
                                const isSelf = comment.authorId === currentUserEmail;
                                const timestamp = comment.createdAt
                                    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                    : "";
                                return (
                                    <div key={comment.id} className={`group flex gap-3 pb-4 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                                        <Avatar
                                            className="h-9 w-9 mt-1 border border-border/70"
                                            title={comment.authorId}
                                        >
                                            <AvatarImage src={comment.authorAvatarUrl || ""} />
                                            <AvatarFallback>{(comment.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className={`flex flex-col gap-1 max-w-[85%] ${isSelf ? "items-end" : "items-start"}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${isSelf
                                                ? "bg-primary text-primary-foreground rounded-tr-md"
                                                : "bg-secondary text-foreground rounded-tl-md"
                                                }`}>
                                                <MarkdownRenderer content={comment.content} simple className={`prose-sm leading-relaxed ${isSelf ? "prose-invert" : ""}`} />
                                            </div>
                                            {timestamp && (
                                                <span
                                                    className={`text-[11px] text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isSelf ? "self-end pr-1" : "self-start pl-1"}`}
                                                >
                                                    {timestamp}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-4 border-t bg-card shadow-inner">
                    <form ref={formRef} action={action} className="flex gap-2">
                        <input type="hidden" name="proposalId" value={proposalId} />
                        <input type="hidden" name="projectId" value={projectId} />
                        <Input
                            name="content"
                            placeholder="Type your message..."
                            autoComplete="off"
                            required
                            className="h-11"
                        />
                        <Button type="submit" size="icon" disabled={isPending} className="h-11 w-11">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
