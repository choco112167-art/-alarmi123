import type { SourceCrawler } from "./types";
import { crawlGenericBoard } from "./generic";

export const crawlBukgu: SourceCrawler = (source) => crawlGenericBoard(source);
