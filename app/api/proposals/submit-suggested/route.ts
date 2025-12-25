import { NextResponse } from "next/server";
import { db } from "@/db";
import { proposals, users, votes } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { buildProposalSummary } from "@/lib/proposal-summary";
import { revalidatePath } from "next/cache";

type SubmitRequest = {
  projectId: string;
  proposals: { title: string; details: string; summary?: string; vote: 1 | -1 }[];
};

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const body = (await req.json()) as SubmitRequest;
  if (!body?.projectId || !Array.isArray(body.proposals) || body.proposals.length === 0) {
    return NextResponse.json({ error: "Missing proposals" }, { status: 400 });
  }

  const userId = user.id ?? user.email;

  const prepared = body.proposals
    .map((p) => ({
      title: p.title?.trim(),
      details: p.details?.trim(),
      summary: p.summary?.trim(),
      vote: p.vote,
    }))
    .filter((p) => p.title && p.details && (p.vote === 1 || p.vote === -1))
    .slice(0, 3);

  if (prepared.length === 0) {
    return NextResponse.json({ error: "No valid proposals" }, { status: 400 });
  }

  try {
    await db
      .insert(users)
      .values({
        id: userId,
        email: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        avatarUrl: user.profilePictureUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          avatarUrl: user.profilePictureUrl ?? null,
        },
      });

    for (const item of prepared) {
      const summary =
        item.summary ||
        (await buildProposalSummary(item.title, item.details || "")) ||
        null;

      const [created] = await db
        .insert(proposals)
        .values({
          projectId: body.projectId,
          authorId: user.email,
          authorAvatarUrl: user.profilePictureUrl || null,
          title: item.title,
          description: item.details,
          summary,
          isNegativeInitiative: false,
          userId,
        })
        .returning({ id: proposals.id });

      if (created?.id) {
        await db
          .insert(votes)
          .values({
            proposalId: created.id,
            userId: user.email,
            value: item.vote,
          })
          .onConflictDoUpdate({
            target: [votes.proposalId, votes.userId],
            set: { value: item.vote },
          });
      }
    }

    revalidatePath(`/projects/${body.projectId}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit suggested proposals", error);
    return NextResponse.json({ error: "Failed to submit proposals" }, { status: 500 });
  }
}
