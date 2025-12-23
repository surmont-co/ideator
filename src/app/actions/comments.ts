"use server";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type CommentActionState = {
    error?: string;
    success?: boolean;
};

export async function addComment(prevState: CommentActionState | null, formData: FormData): Promise<CommentActionState> {
    const user = await getUser();
    if (!user) {
        return { error: "Login required" };
    }

    const content = formData.get("content")?.toString();
    const proposalId = formData.get("proposalId")?.toString();
    const projectId = formData.get("projectId")?.toString();

    if (!content || !proposalId) {
        return { error: "Missing required fields" };
    }

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

        await db.insert(comments).values({
            proposalId,
            authorId: user.email,
            authorAvatarUrl: user.profilePictureUrl || null,
            content,
            userId,
        });

        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to add comment:", error);
        return { error: "Failed to post comment" };
    }
}
