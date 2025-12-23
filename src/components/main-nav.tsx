"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { t, type Locale } from "@/lib/i18n"

export function MainNav({
    className,
    locale = "en",
    ...props
}: React.HTMLAttributes<HTMLElement> & { locale?: Locale }) {
    const pathname = usePathname()

    return (
        <nav
            className={cn("flex items-center gap-1 lg:gap-2", className)}
            {...props}
        >
            <Link
                href="/dashboard"
                className={cn(
                    "text-sm font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === "/dashboard"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:text-foreground dark:hover:text-white hover:bg-muted/70 dark:hover:bg-slate-800/70"
                )}
            >
                {t(locale, "nav.dashboard")}
            </Link>
            <Link
                href="/projects/new"
                className={cn(
                    "text-sm font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === "/projects/new"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:text-foreground dark:hover:text-white hover:bg-muted/70 dark:hover:bg-slate-800/70"
                )}
            >
                {t(locale, "nav.newProject")}
            </Link>
            <Link
                href="/projects/my"
                className={cn(
                    "text-sm font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === "/projects/my"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:text-foreground dark:hover:text-white hover:bg-muted/70 dark:hover:bg-slate-800/70"
                )}
            >
                {t(locale, "nav.myProjects")}
            </Link>
            <Link
                href="/contributions"
                className={cn(
                    "text-sm font-semibold px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === "/contributions"
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:text-foreground dark:hover:text-white hover:bg-muted/70 dark:hover:bg-slate-800/70"
                )}
            >
                {t(locale, "nav.myContributions")}
            </Link>
        </nav>
    )
}
