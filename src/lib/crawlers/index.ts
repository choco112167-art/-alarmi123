import type { RegionKey } from "@/config/sources";
import type { SourceCrawler } from "./types";
import { crawlNamgu } from "./namgu";
import { crawlJunggu } from "./junggu";
import { crawlBukgu } from "./bukgu";
import { crawlDonggu } from "./donggu";

export const crawlers: Record<RegionKey, SourceCrawler> = {
  namgu: crawlNamgu,
  junggu: crawlJunggu,
  bukgu: crawlBukgu,
  donggu: crawlDonggu,
};
