import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { projects, proposals, comments, votes } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, ThumbsDown, ThumbsUp, Calendar, ClipboardList } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getTranslations } from "@/lib/i18n-server";

const truncatePreview = (content: string | null, maxChars = 100) => {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
};

export default async function DashboardPage() {
  const user = await getUser();
  const { t } = await getTranslations();

  if (!user) {
    redirect("/");
  }

  // Fetch projects ordered by deadline (closest first)
  const allProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      summary: projects.summary,
      deadline: projects.deadline,
      authorId: projects.authorId,
      authorAvatarUrl: projects.authorAvatarUrl,
      proposalsCount: sql<number>`(select count(1) from proposals where proposals.project_id = projects.id)`,
      commentsCount: sql<number>`(select count(1) from comments c join proposals p on c.proposal_id = p.id where p.project_id = projects.id)`,
      upvotes: sql<number>`(select count(1) from votes v join proposals p on v.proposal_id = p.id where p.project_id = projects.id and v.value = 1)`,
      downvotes: sql<number>`(select count(1) from votes v join proposals p on v.proposal_id = p.id where p.project_id = projects.id and v.value = -1)`,
    })
    .from(projects)
    .orderBy(asc(projects.deadline))
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t("dashboard.welcome", { name: user.firstName || user.email })}
          </p>
        </div>
        <Button asChild className="h-11 px-4">
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("nav.newProject")}
          </Link>
        </Button>
      </div>

      {allProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-2xl h-64 text-center bg-muted/50">
          <p className="text-slate-700 dark:text-slate-200 mb-2 font-medium">{t("dashboard.noProjectsTitle")}</p>
          <p className="text-muted-foreground max-w-lg mb-4">{t("dashboard.noProjectsBody")}</p>
          <Button asChild variant="outline">
            <Link href="/projects/new">{t("dashboard.createFirst")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {allProjects.map((project) => {
            const isPast = new Date(project.deadline) < new Date();
            const hasVotes = (project.upvotes || 0) + (project.downvotes || 0) > 0;
            const previewSource = project.summary || truncatePreview(project.description || project.title, 100) || "No description provided.";

            // ...

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <Card
                  className={`flex flex-col border-border/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full ${
                    isPast ? "bg-slate-100 dark:bg-slate-900/60" : ""
                  }`}
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="leading-tight line-clamp-2 group-hover:text-primary">
                        <MarkdownRenderer content={project.title} simple className="inline prose-headings:m-0 prose-p:m-0" />
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0 border border-border/80" title={project.authorId || ""}>
                          <AvatarImage src={project.authorAvatarUrl || ""} />
                          <AvatarFallback>{(project.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  <CardDescription className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("dashboard.deadline")} {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-0 space-y-4 flex flex-col">
                  <div className="text-sm text-slate-700 dark:text-slate-200 line-clamp-4 overflow-hidden leading-relaxed">
                    <MarkdownRenderer content={previewSource} className="prose-sm dark:prose-invert" />
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between gap-3 sm:gap-4 text-muted-foreground">
                      <div
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                        title={t("dashboard.stats.proposals")}
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span className="text-sm font-semibold">{project.proposalsCount ?? 0}</span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                        title={t("dashboard.stats.votesUp")}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{project.upvotes ?? 0}</span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                        title={t("dashboard.stats.votesDown")}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm font-semibold">{project.downvotes ?? 0}</span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                        title={t("dashboard.stats.comments")}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-semibold text-foreground">{project.commentsCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
          })}
        </div>
      )}
    </div>
  );
}
