export interface WebProjectItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  technologies: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  category: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateWebProjectInput = Omit<WebProjectItem, "createdAt" | "updatedAt">;

export type UpdateWebProjectInput = Partial<CreateWebProjectInput>;
