import type { SourceCrawler } from "./types";
import { crawlGenericBoard } from "./generic";

export const crawlDonggu: SourceCrawler = (source) => crawlGenericBoard(source);
