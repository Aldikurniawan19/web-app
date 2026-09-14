import React from "react";
import { AppPlatform } from "@/types/store";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platforms: AppPlatform[];
  showLabels?: boolean;
  selectedPlatform?: AppPlatform;
  onSelectPlatform?: (p: AppPlatform) => void;
  className?: string;
}

export function PlatformBadge({
  platforms,
  showLabels = false,
  selectedPlatform,
  onSelectPlatform,
  className,
}: PlatformBadgeProps) {
  // SVG Icon for clean Android representation
  const renderAndroidIcon = (size = 15) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4111 13.8533 8.0818 12 8.0818c-1.8535 0-3.5905.3293-5.1367.8679L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
    </svg>
  );

  if (showLabels && onSelectPlatform) {
    // Interactive Platform Selection Mode (Android APK)
    const isAvailable = platforms.includes("android");
    const isSelected = selectedPlatform === "android";

    return (
      <div className={cn("w-full", className)}>
        <button
          type="button"
          disabled={!isAvailable}
          onClick={() => onSelectPlatform("android")}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-xl border p-3.5 text-xs font-semibold transition-all select-none",
            isSelected
              ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
              : isAvailable
              ? "border-border bg-surface text-foreground hover:border-slate-300 hover:bg-slate-50"
              : "cursor-not-allowed border-dashed border-slate-200 bg-slate-50 text-slate-400 opacity-50"
          )}
        >
          <div className={cn(isSelected ? "text-primary" : "text-slate-600")}>
            {renderAndroidIcon(18)}
          </div>
          <span>Android (Paket APK)</span>
        </button>
      </div>
    );
  }

  // Mini Platform Icon Row (Used on App Cards)
  return (
    <div className={cn("flex items-center gap-1.5 text-slate-500 text-xs font-medium", className)}>
      <span title="Dukungan Android APK" className="flex items-center gap-1 text-slate-600">
        {renderAndroidIcon(13)}
        <span>Android</span>
      </span>
    </div>
  );
}

