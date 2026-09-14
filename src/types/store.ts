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
  imageUrl?: string;
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
  iconUrl?: string;
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
  apkUrl?: string;
  apkFileName?: string;
}

export interface RelatedAppItem {
  id: string;
  name: string;
  rating: number;
  fileSize: string;
  category: string;
  iconUrl?: string;
  iconType: "task" | "note" | "todo";
  iconColor: string;
}

export type CreateAppInput = Omit<
  AppItem,
  "rating" | "reviewsCount" | "downloadsCount" | "lastUpdated"
> &
  Partial<Pick<AppItem, "rating" | "reviewsCount" | "downloadsCount" | "lastUpdated">>;
