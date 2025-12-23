"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

interface ProposalTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  upvotes: number;
  downvotes: number;
  maxPossibleVotes?: number; // Optional: total users or a fixed max to scale bars
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  ProposalTriggerProps
>(({ className, children, upvotes, downvotes, maxPossibleVotes, ...props }, ref) => {
  // Logic for the bar chart background
  // Center is 50%.
  // We scale the bars relative to maxPossibleVotes or just a reasonable scale.
  const total = upvotes + downvotes;
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
          "flex flex-1 items-center justify-between py-4 px-4 font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 [&[data-state=open]>svg]:rotate-180 text-slate-900 dark:text-slate-100",
          className
        )}
        style={backgroundStyle}
        {...props}
      >
        <div className="flex items-center gap-4 w-full">
          <span className={cn(
            "text-sm font-bold min-w-[3.5rem] text-center px-2 py-1 rounded",
            upvotes - downvotes > 0 ? "text-green-600 dark:text-green-400" : 
            upvotes - downvotes < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"
          )}>
            {upvotes - downvotes > 0 ? `+${upvotes - downvotes}` : upvotes - downvotes}
          </span>
          <span className="flex-1 text-left">{children}</span>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-slate-400" />
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
    <div className={cn("pb-4 pt-0 px-4", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
