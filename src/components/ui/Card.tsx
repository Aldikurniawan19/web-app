import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  className,
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-6 transition-all duration-200",
        hoverEffect &&
          "hover:border-border-subtle hover:bg-surface hover:shadow-lg hover:shadow-primary/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
