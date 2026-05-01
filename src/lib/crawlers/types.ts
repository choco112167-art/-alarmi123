import type { NoticeSource } from "@/config/sources";

export type ListItem = {
  title: string;
  publishedAt: Date | null;
  detailUrl: string;
};

export type Attachment = {
  name: string;
  url: string;
};

export type CrawledNotice = {
  source: NoticeSource;
  title: string;
  originalUrl: string;
  publishedAt: Date | null;
  matchedKeywords: string[];
};

export type SourceCrawler = (source: NoticeSource) => Promise<CrawledNotice[]>;
