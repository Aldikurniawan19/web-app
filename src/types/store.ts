export type AppPlatform = "android";

export type AppCategory =
  | "Semua"
  | "Produktivitas"
  | "Pendidikan"
  | "Bisnis"
  | "Multimedia"
  | "Utility"
  | "Game";

export interface AppScreenshot {
  id: string;
  title: string;
  description: string;
  type: "light" | "dark" | "editor" | "calendar";
}

export interface AppItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: Exclude<AppCategory, "Semua">;
  rating: number;
  reviewsCount: string;
  fileSize: string;
  version: string;
  developer: string;
  lastUpdated: string;
  platforms: AppPlatform[];
  iconType: "document" | "education" | "business" | "photo" | "vpn" | "game" | "cloud" | "media";
  iconColor: string;
  features: string[];
  screenshots: AppScreenshot[];
  downloadsCount: string;
  systemRequirements: {
    os: string;
    ram: string;
    storage: string;
  };
}

export interface RelatedAppItem {
  id: string;
  name: string;
  rating: number;
  fileSize: string;
  category: string;
  iconType: "task" | "note" | "todo";
  iconColor: string;
}
