import React, { useState } from "react";
import {
  FileText,
  GraduationCap,
  BarChart3,
  Image as ImageIcon,
  Shield,
  Gamepad2,
  Cloud,
  Play,
  CheckSquare,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppIconProps {
  type?: string;
  iconUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  colorClass?: string;
  alt?: string;
}

export function AppIcon({
  type = "document",
  iconUrl,
  className,
  size = "md",
  colorClass = "bg-primary",
  alt = "App Icon",
}: AppIconProps) {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: "h-9 w-9 rounded-xl p-2",
    md: "h-14 w-14 rounded-2xl p-3",
    lg: "h-16 w-16 rounded-2xl p-3.5",
    xl: "h-24 w-24 rounded-3xl p-5",
  };

  const imageContainerSizeStyles = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-14 w-14 rounded-2xl",
    lg: "h-16 w-16 rounded-2xl",
    xl: "h-24 w-24 rounded-3xl",
  };

  const iconSizeStyles = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-9 w-9",
    xl: "h-14 w-14",
  };

  // Jika ada URL gambar ikon dan belum error, tampilkan gambar langsung
  if (iconUrl && !imageError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-none transition-transform duration-200 shrink-0",
          imageContainerSizeStyles[size],
          className
        )}
      >
        <img
          src={iconUrl}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover select-none"
          loading="lazy"
        />
      </div>
    );
  }

  const renderIcon = () => {
    const s = iconSizeStyles[size];
    switch (type) {
      case "document":
      case "note":
        return <FileText className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "education":
        return <GraduationCap className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "business":
        return <BarChart3 className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "photo":
        return <ImageIcon className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "vpn":
        return <Shield className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "game":
        return <Gamepad2 className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "cloud":
        return <Cloud className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "media":
        return <Play className={cn(s, "text-white fill-white")} strokeWidth={2} />;
      case "task":
        return <CheckSquare className={cn(s, "text-white")} strokeWidth={2.2} />;
      case "todo":
        return <ListTodo className={cn(s, "text-white")} strokeWidth={2.2} />;
      default:
        return <FileText className={cn(s, "text-white")} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shadow-md shadow-slate-200/50 transition-transform duration-200 shrink-0",
        colorClass,
        sizeStyles[size],
        className
      )}
    >
      {renderIcon()}
    </div>
  );
}
