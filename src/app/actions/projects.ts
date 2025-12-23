"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { z } from "zod";
import { fallbackSummary, generateSummaryFromText } from "@/lib/ai";

type CreateProjectState = {
    error?: string;
    issues?: Record<string, string[]>;
};

const createProjectSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid deadline",
    }),
});

export async function createProject(prevState: CreateProjectState | null, formData: FormData): Promise<CreateProjectState | void> {
    const user = await getUser();
    if (!user) {
        return { error: "You must be logged in to create a project" };
    }

    const validatedFields = createProjectSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        deadline: formData.get("deadline"),
    });

    if (!validatedFields.success) {
        return {
            error: "Validation failed",
            issues: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, deadline } = validatedFields.data;

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

        const summary =
            (await generateSummaryFromText(`${title}\n\n${description ?? ""}`, 60)) ??
            fallbackSummary(description || title, 240);

        await db.insert(projects).values({
            title,
            description: description || null,
            summary: summary || null,
            deadline: new Date(deadline),
            authorId: user.email,
            authorAvatarUrl: user.profilePictureUrl || null,
            userId,
        }).returning({ id: projects.id });

        // Assuming we want to redirect to the projects list or the new project
        // For now, redirect to dashboard or project list if exists.
        // Let's redirect to the dashboard for now as per plan
        revalidatePath("/dashboard");
        revalidatePath("/projects/my");
    } catch (error) {
        console.error("Failed to create project:", error);
        return { error: "Database error: Failed to create project" };
    }

    redirect("/dashboard");
}
