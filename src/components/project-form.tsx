"use client";

import { useActionState } from "react";
import { createProject, type CreateProjectState } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectForm() {
    const [state, action, isPending] = useActionState<CreateProjectState, FormData>(createProject, null);

    return (
        <form action={action} className="space-y-6 max-w-2xl mx-auto p-6 border border-border/80 rounded-2xl bg-card text-card-foreground shadow-md">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">New Project</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Define the details of the new proposal initiative.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Q1 Improvements"
                        required
                        minLength={3}
                        className="h-11"
                    />
                    {state?.issues?.title && (
                        <p className="text-red-500 text-sm">{state.issues.title[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the goals..."
                        className="min-h-[140px] leading-relaxed"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        required
                        className="h-11"
                    />
                    {state?.issues?.deadline && (
                        <p className="text-red-500 text-sm">{state.issues.deadline[0]}</p>
                    )}
                </div>
            </div>

            {state?.error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <div className="flex justify-end gap-4">
                <Button type="submit" className="h-11 px-5 font-semibold" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Project"}
                </Button>
            </div>
        </form>
    );
}
