"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { supportedLocales, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const setLocale = (nextLocale: Locale) => {
        if (nextLocale === locale) return;
        startTransition(() => {
            document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
            router.refresh();
        });
        setOpen(false);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-semibold"
                onClick={() => setOpen((v) => !v)}
                disabled={isPending}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {locale.toUpperCase()}
                <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            {open && (
                <div className="absolute right-0 mt-1 w-24 rounded-md border border-border bg-card shadow-lg z-50">
                    {supportedLocales.map((loc) => (
                        <button
                            key={loc}
                            type="button"
                            className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors ${
                                loc === locale ? "font-semibold text-primary" : ""
                            }`}
                            onClick={() => setLocale(loc)}
                        >
                            {loc.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
