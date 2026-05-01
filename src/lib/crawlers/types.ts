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
  summary: string;
  contentText: string;
  originalUrl: string;
  attachmentUrls: string[];
  publishedAt: Date | null;
  deadline: Date | null;
  matchedKeywords: string[];
};

export type SourceCrawler = (source: NoticeSource) => Promise<CrawledNotice[]>;
