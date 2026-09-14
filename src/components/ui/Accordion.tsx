"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  id: string;
  title: string;
  badgeText?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  badgeText,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/80 last:border-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <div className="flex items-center gap-3 pr-4">
          <span className="text-base font-semibold text-foreground">
            {title}
          </span>
          {badgeText && (
            <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-foreground-muted border border-border">
              {badgeText}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-foreground-muted transition-transform duration-200",
            isOpen && "rotate-180 text-accent"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-foreground-muted">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border rounded-xl border border-border bg-surface/60 p-2 sm:p-4 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
