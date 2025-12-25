import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Project</h1>
                <p className="text-slate-700 dark:text-slate-300 max-w-2xl">
                    Create a new space for proposals and community prioritization.
                </p>
            </div>

            <ProjectForm />
        </div>
    );
}
