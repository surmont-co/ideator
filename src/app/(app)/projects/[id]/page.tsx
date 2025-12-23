import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { projects, proposals, votes, comments } from "@/db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, ro as roLocale } from "date-fns/locale";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ProjectDescriptionToggle } from "@/components/project-description-toggle";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalList } from "@/components/proposal-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTranslations } from "@/lib/i18n-server";
import { fallbackSummary } from "@/lib/ai";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params correctly in Next.js 15+ if needed (dynamic routes are async props in recent canaries, but standard is params object).
    // Next 15: params is a Promise.
    const { id } = await params;

    const user = await getUser();
    const { t, locale } = await getTranslations();

    if (!user) {
        redirect("/");
    }

    // 1. Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
    });

    if (!project) {
        notFound();
    }

    // Fetch proposals with aggregated votes
    const proposalsWithStats = await db
        .select({
            id: proposals.id,
            title: proposals.title,
            description: proposals.description,
            summary: proposals.summary,
            authorId: proposals.authorId,
            authorAvatarUrl: proposals.authorAvatarUrl,
            createdAt: proposals.createdAt,
            upvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.value} = 1 THEN 1 ELSE 0 END), 0)`,
            downvotes: sql<number>`COALESCE(SUM(CASE WHEN ${votes.value} = -1 THEN 1 ELSE 0 END), 0)`,
        })
        .from(proposals)
        .leftJoin(votes, eq(proposals.id, votes.proposalId))
        .where(eq(proposals.projectId, id))
        .groupBy(proposals.id)
        .orderBy(desc(proposals.createdAt));


    // Client requires prop serialization issues with bigint or dates sometimes. 
    // Drizzle dates are Date objects. Server Components -> Client Components need simple types.
    // upvotes/downvotes from SQL are usually numbers or strings.

    // User-specific vote map
    const userVoteRows = await db
        .select({
            proposalId: votes.proposalId,
            value: votes.value,
        })
        .from(votes)
        .where(eq(votes.userId, user.email));

    const voteMap = new Map(userVoteRows.map((v) => [v.proposalId, v.value]));

    const formattedProposals = proposalsWithStats.map(p => ({
        ...p,
        summary: p.summary,
        createdAt: p.createdAt,
        upvotes: Number(p.upvotes),
        downvotes: Number(p.downvotes),
        currentUserVote: voteMap.get(p.id) ?? null,
    }));



    // 3. Fetch Comments (for all proposals in this project)
    // Optimization: fetch all comments for project's proposals
    // We can filter in JS since it's likely not huge yet.
    // Or complex join.
    const allComments = await db
        .select()
        .from(comments)
        .leftJoin(proposals, eq(comments.proposalId, proposals.id))
        .where(eq(proposals.projectId, id))
        .orderBy(asc(comments.createdAt));

    // allComments result is { comments: ..., proposals: ... } from join.
    // We want just comments mapped.
    const mappedComments = allComments.map(r => ({
        ...r.comments,
        createdAt: r.comments.createdAt
        // Ensure proposalId is present
    }));

    const formatLocale = locale === "ro" ? roLocale : enUS;
    const dateFormat = locale === "ro" ? "d MMMM yyyy 'la' HH:mm" : "d MMMM yyyy 'at' h:mm a";
    const dueLabel = formatDistanceToNow(new Date(project.deadline), { addSuffix: true });
    const roMonthMap: Record<string, string> = {
        ianuarie: "Ianuarie",
        februarie: "Februarie",
        martie: "Martie",
        aprilie: "Aprilie",
        mai: "Mai",
        iunie: "Iunie",
        iulie: "Iulie",
        august: "August",
        septembrie: "Septembrie",
        octombrie: "Octombrie",
        noiembrie: "Noiembrie",
        decembrie: "Decembrie",
    };
    const formatDeadline = (date: Date) => {
        const formatted = format(date, dateFormat, { locale: formatLocale });
        if (locale !== "ro") return formatted;
        return formatted.replace(
            /\b(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b/,
            (match) => roMonthMap[match] || match,
        );
    };
    const summaryContent = project.summary || fallbackSummary(project.description || project.title, 240) || "";
    const fullContent = project.description || summaryContent;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" className="pl-0 gap-2 text-slate-600 dark:text-slate-300 hover:text-foreground" asChild>
                    <Link href="/dashboard">
                        <ChevronLeft className="w-4 h-4" />
                        {t("project.back")}
                    </Link>
                </Button>
                <Button asChild variant="secondary" className="hidden sm:inline-flex">
                    <Link href="#proposal-form">{t("project.addProposal")}</Link>
                </Button>
            </div>

            <Card className="flex flex-col border-border/80 shadow-sm rounded-2xl bg-card">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <h1 className="text-3xl font-bold leading-tight">
                                    <MarkdownRenderer content={project.title} simple className="prose-headings:m-0 prose-p:m-0 inline" />
                                </h1>
                                <Avatar className="h-11 w-11 border border-border/80">
                                    <AvatarImage src={project.authorAvatarUrl || ""} />
                                    <AvatarFallback>{(project.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2 rounded-full bg-secondary text-foreground px-3 py-1.5 font-semibold shadow-inner">
                                <Calendar className="w-4 h-4" />
                                <span>{t("project.due", { label: dueLabel })}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDeadline(new Date(project.deadline))}</span>
                            </span>
                            </div>
                        </div>
                    </div>
                    <ProjectDescriptionToggle
                        summary={summaryContent}
                        full={fullContent}
                        showLabel={t("project.showDetails")}
                        hideLabel={t("project.hideDetails")}
                    />
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr] xl:grid-cols-[1.8fr,1fr]">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">{t("project.proposalsTitle")}</h2>
                            <p className="text-sm text-muted-foreground">{t("project.proposalsSub")}</p>
                        </div>
                        <Button asChild variant="outline" className="h-10 px-3">
                            <Link href="#proposal-form">{t("project.addProposal")}</Link>
                        </Button>
                    </div>
                    {formattedProposals.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                            {t("project.noProposals")}
                        </div>
                    ) : (
                        <ProposalList
                            proposals={formattedProposals}
                            comments={mappedComments}
                            projectId={project.id}
                            currentUserEmail={user.email}
                            locale={locale}
                        />
                    )}
                </div>

                <div id="proposal-form" className="space-y-4 lg:sticky lg:top-24">
                        <ProposalForm
                            projectId={project.id}
                            locale={locale}
                            existingProposals={formattedProposals.map((p) => ({
                                id: p.id,
                                title: p.title,
                                description: p.description,
                                summary: p.summary,
                                userVote: p.currentUserVote ?? null,
                            }))}
                            projectTitle={project.title}
                            projectDescription={project.description || ""}
                        />
                </div>
            </div>
        </div>
    );
}
