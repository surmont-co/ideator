import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    simple?: boolean; // If true, strips block elements or renders minimally
}

export function MarkdownRenderer({ content, className, simple }: MarkdownRendererProps) {
    if (simple) {
        // For simpler rendering (e.g. titles), we might want to disallow huge blocks
        // or just rely on CSS to keep it inline-ish.
        // 'prose' adds a lot of margins.
        return (
            <div className={cn("prose dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-0", className)}>
                <ReactMarkdown
                    allowedElements={['p', 'strong', 'em', 'code', 'span', 'a', 'del']}
                    unwrapDisallowed
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    }

    return (
        <article className={cn("prose dark:prose-invert max-w-none", className)}>
            <ReactMarkdown>
                {content}
            </ReactMarkdown>
        </article>
    );
}
