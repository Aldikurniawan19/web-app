import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none";

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs gap-1.5 rounded-xl",
      md: "h-11 px-5 text-sm gap-2 rounded-xl",
      lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-b from-blue-500 via-primary to-blue-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_0_#1d4ed8,0_4px_8px_rgba(37,99,235,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_0_#1d4ed8,0_6px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8] dark:from-blue-400 dark:via-blue-600 dark:to-blue-700 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_0_#1e3a8a,0_4px_10px_rgba(0,0,0,0.4)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_#1e3a8a,0_6px_14px_rgba(0,0,0,0.5)] dark:active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_#1e3a8a]",
      secondary:
        "bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-foreground border border-slate-200 dark:border-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2.5px_0_#cbd5e1,0_3px_6px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2.5px_0_#0f172a,0_3px_6px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3.5px_0_#cbd5e1,0_5px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_0_#cbd5e1]",
      outline:
        "bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-300 dark:border-slate-700 text-foreground hover:border-primary hover:text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_0_#cbd5e1] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#cbd5e1]",
      ghost:
        "text-foreground-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95",
      accent:
        "bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_3px_0_#1d4ed8,0_4px_8px_rgba(59,130,246,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_0_#1d4ed8,0_6px_12px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#1d4ed8]",
      danger:
        "bg-gradient-to-b from-rose-500 via-danger to-rose-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_0_#be123c,0_4px_8px_rgba(225,29,72,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_0_#be123c,0_6px_12px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#be123c] dark:from-rose-500 dark:via-rose-600 dark:to-rose-700 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_0_#881337,0_4px_10px_rgba(0,0,0,0.4)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_#881337,0_6px_14px_rgba(0,0,0,0.5)] dark:active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_#881337]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
