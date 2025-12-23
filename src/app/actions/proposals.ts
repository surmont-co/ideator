"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { proposals, votes, users } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { z } from "zod";
import { fallbackSummary } from "@/lib/ai";

type ProposalActionState = {
    error?: string;
    issues?: Record<string, string[]>;
    success?: boolean;
};

const createProposalSchema = z.object({
    projectId: z.string(),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().optional(),
    initialVote: z.enum(["1", "-1"]),
    summary: z.string().optional(),
});

export async function createProposal(prevState: ProposalActionState | null, formData: FormData): Promise<ProposalActionState> {
    const user = await getUser();
    if (!user) {
        return { error: "You must be logged in to create a proposal" };
    }

    const validatedFields = createProposalSchema.safeParse({
        projectId: formData.get("projectId"),
        title: formData.get("title"),
        description: formData.get("description"),
        initialVote: formData.get("initialVote"),
        summary: formData.get("summary"),
    });

    if (!validatedFields.success) {
        return {
            error: "Validation failed",
            issues: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { projectId, title, description, initialVote, summary } = validatedFields.data;

    try {
        const userId = user.id ?? user.email;

        await db.insert(users).values({
            id: userId,
            email: user.email,
            firstName: user.firstName ?? null,
            lastName: user.lastName ?? null,
            avatarUrl: user.profilePictureUrl ?? null,
        }).onConflictDoUpdate({
            target: users.id,
            set: {
                email: user.email,
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                avatarUrl: user.profilePictureUrl ?? null,
            },
        });

        // 1. Create Proposal
        const [newProposal] = await db
            .insert(proposals)
            .values({
                projectId,
                authorId: user.email, // Using email as ID for now based on auth.ts
                authorAvatarUrl: user.profilePictureUrl || null,
                title,
                description: description || null,
                summary: (summary?.toString().trim() || fallbackSummary(description || title, 220)) ?? null,
                isNegativeInitiative: false, // Defaulting for now
                userId,
            })
            .returning({ id: proposals.id });

        if (!newProposal) {
            throw new Error("Failed to return new proposal ID");
        }

        // 2. Cast Initial Vote
        await db.insert(votes).values({
            proposalId: newProposal.id,
            userId: user.email,
            value: parseInt(initialVote),
        });

        revalidatePath(`/projects/${projectId}`);
    } catch (error) {
        console.error("Failed to create proposal:", error);
        return { error: "Database error: Failed to create proposal" };
    }

    return { success: true };
}

export async function castVote(proposalId: string, value: number, projectId: string) {
    const user = await getUser();
    if (!user) {
        return { error: "Login required" };
    }

    try {
        // Upsert vote
        await db
            .insert(votes)
            .values({
                proposalId,
                userId: user.email,
                value,
            })
            .onConflictDoUpdate({
                target: [votes.proposalId, votes.userId],
                set: { value },
            });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to vote:", error);
        return { error: "Failed to cast vote" };
    }
}
