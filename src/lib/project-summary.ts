import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fallbackSummary, generateSummaryFromText } from "@/lib/ai";

const SUMMARY_WORD_LIMIT = 48;
const SUMMARY_CHAR_LIMIT = 320;

export async function generateProjectSummary(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return false;
  if (project.summary) return false;

  const promptSource = [
    "Summarize as a concise explanation of the project's purpose and intended impact.",
    "Assume the title is shown separately; do not repeat or paraphrase the title or its keywords.",
    "Format the summary as a request for action from the reader, as if you were explaining it to them in a conversation.",
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
