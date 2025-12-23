import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { LogOut } from "lucide-react";

export async function UserNav() {
    const user = await getUser();
    const locale = await getRequestLocale();

    return (
        <div className="flex items-center gap-3">
            <ModeToggle />
            {user && (
                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium hidden md:inline-block">
                    {user.firstName || user.email}
                </span>
            )}
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                <Link href="/api/auth/logout" aria-label={t(locale, "nav.logout")}>
                    <LogOut className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
