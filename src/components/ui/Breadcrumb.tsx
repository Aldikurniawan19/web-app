"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.isCurrent ?? isLast;
          const Icon = item.icon;

          return (
            <li key={`breadcrumb-item-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isCurrent ? (
                <span
                  className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md select-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors cursor-pointer select-none"
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors cursor-pointer select-none active:scale-95"
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
                  )}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium select-none">
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
