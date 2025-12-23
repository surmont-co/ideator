import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fallbackSummary, generateSummaryFromText } from "@/lib/ai";

const SUMMARY_WORD_LIMIT = 48;
const SUMMARY_CHAR_LIMIT = 320;

type SummaryOptions = {
  force?: boolean;
};

export async function generateProjectSummary(projectId: string, options?: SummaryOptions) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return false;
  if (project.summary && !options?.force) return false;

  const promptSource = [
    "Write a terse noun-phrase summary (no imperatives, no second-person, no pleasantries).",
    "Assume the title is shown separately; do not repeat or paraphrase the title or its keywords.",
    "Describe what the project collects (types of proposals/ideas) and any criteria or expectations mentioned; omit if not present.",
    "Keep it neutral/descriptive, as a short label for the project purpose.",
    `Title: ${project.title}`,
    `Description:\n${project.description ?? ""}`,
  ].join("\n\n");
  const generated = await generateSummaryFromText(promptSource, SUMMARY_WORD_LIMIT, SUMMARY_CHAR_LIMIT);
  const summary =
    fallbackSummary(generated, SUMMARY_CHAR_LIMIT) ??
    fallbackSummary(project.description || project.title, SUMMARY_CHAR_LIMIT);

  if (!summary) return false;

  await db
    .update(projects)
    .set({ summary })
    .where(eq(projects.id, projectId));

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);

  return true;
}
