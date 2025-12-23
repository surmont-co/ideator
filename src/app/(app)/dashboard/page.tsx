import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { asc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { getTranslations } from "@/lib/i18n-server";

export default async function DashboardPage() {
  const user = await getUser();
  const { t } = await getTranslations();

  if (!user) {
    redirect("/");
  }

  // Fetch projects ordered by deadline (closest first)
  const allProjects = await db
    .select()
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

            // ...

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <Card className="flex flex-col border-border/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="leading-tight line-clamp-2 group-hover:text-primary">
                        <MarkdownRenderer content={project.title} simple className="inline prose-headings:m-0 prose-p:m-0" />
                      </CardTitle>
                      <Avatar className="h-10 w-10 shrink-0 border border-border/80">
                        <AvatarImage src={project.authorAvatarUrl || ""} />
                        <AvatarFallback>{(project.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  <CardDescription className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {t("dashboard.deadline")} {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <div className="text-sm text-slate-700 dark:text-slate-200 line-clamp-4 overflow-hidden leading-relaxed">
                    <MarkdownRenderer content={project.summary || project.description || "No description provided."} className="prose-sm dark:prose-invert" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-sm font-semibold text-primary group-hover:underline">
                      {isPast ? t("dashboard.viewResults") : t("dashboard.voteDiscuss")}
                    </div>
                </CardFooter>
              </Card>
            </Link>
          );
          })}
        </div>
      )}
    </div>
  );
}
