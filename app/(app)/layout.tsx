import { SiteHeader } from "@/components/site-header";
import { getUser } from "@/lib/auth";
import { getRequestLocale } from "@/lib/i18n-server";
import { redirect } from "next/navigation";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Double check authentication here as well to protect all routes in (app)
    const user = await getUser();
    if (!user) {
        redirect("/");
    }

    const locale = await getRequestLocale();

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale} />
            <main className="flex-1 container py-6 mx-auto max-w-7xl px-4">
                {children}
            </main>
        </div>
    );
}
