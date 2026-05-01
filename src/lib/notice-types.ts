import type { RegionKey } from "@/config/sources";

export type StoredNotice = {
  id: string;
  sourceRegion: RegionKey;
  sourceName: string;
  title: string;
  originalUrl: string;
  publishedAt: string | null;
  detectedAt: string;
  matchedKeywords: string[];
};
