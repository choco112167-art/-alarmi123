import type { SourceCrawler } from "./types";
import { crawlGenericBoard } from "./generic";

export const crawlJunggu: SourceCrawler = (source) => crawlGenericBoard(source);
