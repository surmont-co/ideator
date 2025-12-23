"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface ProposalTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  upvotes: number;
  downvotes: number;
  maxPossibleVotes?: number; // Optional: total users or a fixed max to scale bars
  commentCount?: number;
  createdAt?: Date | null;
  authorId?: string;
  authorAvatarUrl?: string | null;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  ProposalTriggerProps
>(({ className, children, upvotes, downvotes, commentCount = 0, createdAt, maxPossibleVotes, ...props }, ref) => {
  // Logic for the bar chart background
  // Center is 50%.
  // We scale the bars relative to maxPossibleVotes or just a reasonable scale.
  const scale = maxPossibleVotes || Math.max(upvotes, downvotes, 1);

  const greenWidth = (upvotes / scale) * 50; // Max 50% of the total width
  const redWidth = (downvotes / scale) * 50;   // Max 50% of the total width

  // Background gradient:
  // Red grows left from 50%, Green grows right from 50%
  const backgroundStyle = {
    background: `linear-gradient(to right, 
      transparent 0%, 
      transparent ${50 - redWidth}%, 
      rgba(239, 68, 68, 0.15) ${50 - redWidth}%, 
      rgba(239, 68, 68, 0.15) 50%, 
      rgba(34, 197, 94, 0.15) 50%, 
      rgba(34, 197, 94, 0.15) ${50 + greenWidth}%, 
      transparent ${50 + greenWidth}%, 
      transparent 100%)`
  };

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex flex-1 items-center justify-between gap-4 py-3 px-4 font-semibold transition-all hover:bg-secondary/60 dark:hover:bg-slate-800/60 [&[data-state=open]>svg]:rotate-180 text-slate-900 dark:text-slate-100 rounded-2xl",
          className
        )}
        style={backgroundStyle}
        {...props}
      >
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 text-left">
            <span className="block text-base font-semibold leading-tight">
              {children}
            </span>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {createdAt && (
                <span>Added {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold min-w-[4.5rem] justify-center px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/50 shadow-sm">
            <span className="text-green-600 dark:text-green-400">{upvotes}</span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 dark:text-rose-400">{downvotes}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {commentCount}
          </span>
          <Avatar className="h-8 w-8 border border-border/60">
            <AvatarImage src={props.authorAvatarUrl || ""} />
            <AvatarFallback>{(props.authorId || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-slate-400 group-hover:text-foreground" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-3 pt-0 px-3", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
