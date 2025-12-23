import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-slate-950/70">
            <div className="container flex h-16 items-center gap-4 px-4 w-full max-w-7xl mx-auto">
                <div className="mr-4 hidden md:flex">
                    <a href="/dashboard" className="mr-6 flex items-center space-x-2 font-semibold text-lg tracking-tight text-foreground hover:text-primary transition-colors">
                        Ideator
                    </a>
                    <MainNav locale={locale} />
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="flex items-center gap-3 md:hidden">
                        <a href="/dashboard" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                            Ideator
                        </a>
                    </div>
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search/Command could go here */}
                    </div>
                    <LanguageSwitcher locale={locale} />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
