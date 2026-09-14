import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "accent" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium transition-colors select-none";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs rounded-full gap-1",
    md: "px-3 py-1 text-xs rounded-full gap-1.5",
  };

  const variantStyles = {
    default:
      "bg-surface text-foreground-muted border border-border",
    primary:
      "bg-primary-subtle text-accent border border-primary/30",
    success:
      "bg-success-subtle text-success border border-success/30",
    accent:
      "bg-accent-subtle text-accent border border-accent/30",
    outline:
      "border border-border text-foreground-muted",
  };

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
