"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type Props = {
    summary: string;
    full: string;
    showLabel: string;
    hideLabel: string;
};

export function ProjectDescriptionToggle({ summary, full, showLabel, hideLabel }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [shouldGlow, setShouldGlow] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const content = expanded ? full : summary;
    const label = expanded ? hideLabel : showLabel;

    // Start glow after a short delay; stop it after first click during the page lifetime.
    useEffect(() => {
        if (hasInteracted) {
            return;
        }
        const timer = window.setTimeout(() => setShouldGlow(true), 2800);
        return () => window.clearTimeout(timer);
    }, [hasInteracted]);

    return (
        <div className="rounded-xl border border-border/60 bg-white/60 dark:bg-slate-900/40 px-4 py-3 relative">
            <div className="flex items-start">
                <div className="flex-1 pr-32">
                    <MarkdownRenderer
                        content={content}
                        className="max-w-none leading-relaxed text-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="absolute right-4 bottom-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className={`shrink-0 transition-shadow ${shouldGlow ? "animate-pulse ring-2 ring-orange-400/70 shadow-[0_0_0_4px_rgba(251,146,60,0.15)]" : ""}`}
                        onClick={() => {
                            setHasInteracted(true);
                            setShouldGlow(false);
                            setExpanded((prev) => !prev);
                        }}
                        aria-expanded={expanded}
                    >
                        {label}
                    </Button>
                </div>
            </div>
        </div>
    );
}
