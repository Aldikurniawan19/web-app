"use client";

import React from "react";
import { AppCategory } from "@/types/store";
import { CATEGORIES } from "@/constants/app-store-data";
import { cn } from "@/lib/utils";

interface CategoryFiltersProps {
  selectedCategory: AppCategory;
  onSelectCategory: (c: AppCategory) => void;
  className?: string;
}

export function CategoryFilters({
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFiltersProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none",
        className
      )}
    >
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none",
              isActive
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-foreground dark:hover:text-white"
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
