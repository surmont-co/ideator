import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, isNull, lt, sql } from "drizzle-orm";
import { generateProjectSummary } from "@/lib/project-summary";

const BATCH_SIZE = 5;
const STALE_MINUTES = 5;

export async function GET() {
  const thresholdSeconds = Math.floor(Date.now() / 1000) - STALE_MINUTES * 60;
  const threshold = new Date(thresholdSeconds * 1000);

  const pending = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        isNull(projects.summary),
        lt(
          sql<number>`coalesce(unixepoch(${projects.createdAt}), unixepoch(${projects.createdAt}, 'unixepoch'))`,
          thresholdSeconds,
        ),
      ),
    )
    .limit(BATCH_SIZE);

  let processed = 0;
  for (const project of pending) {
    const updated = await generateProjectSummary(project.id);
    if (updated) processed += 1;
  }

  return NextResponse.json({
    ok: true,
    processed,
    checked: pending.length,
    threshold,
  });
}
