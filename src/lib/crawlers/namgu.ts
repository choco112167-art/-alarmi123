import type { SourceCrawler } from "./types";
import { crawlGenericBoard } from "./generic";

export const crawlNamgu: SourceCrawler = (source) => crawlGenericBoard(source);
