import * as cheerio from "cheerio";
import { getMatchedKeywords, shouldKeepNotice } from "@/lib/keywords";
import type { CrawledNotice, SourceCrawler } from "./types";
import { crawlGenericBoard } from "./generic";
import { delay, fetchHtml } from "./http";

const NAMGU_BASE_URL = "https://www.ulsannamgu.go.kr";

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function absoluteUrl(href: string) {
  try {
    return new URL(href, NAMGU_BASE_URL).toString();
  } catch {
    return null;
  }
}

async function crawlNamguSearch(source: Parameters<SourceCrawler>[0]) {
  const notices: CrawledNotice[] = [];
  const seen = new Set<string>();

  for (const searchUrl of source.searchUrls ?? []) {
    await delay(500);
    const html = await fetchHtml(searchUrl);
    const $ = cheerio.load(html);

    $(".news dl.C_Cts").each((_, element) => {
      const anchor = $(element).find("dt a.result_loc[href]").first();
      const title = normalizeText(anchor.text());
      const href = anchor.attr("href");
      const summary = normalizeText($(element).find("dd.txt2").first().text());
      const originalUrl = href ? absoluteUrl(href) : null;

      if (!title || !originalUrl || seen.has(originalUrl)) return;

      const titleMatchedKeywords = getMatchedKeywords(title);
      const { keep, matchedKeywords } = shouldKeepNotice(title, summary);
      if (titleMatchedKeywords.length === 0) return;
      if (!keep) return;

      seen.add(originalUrl);
      notices.push({
        source,
        title,
        originalUrl,
        publishedAt: null,
        matchedKeywords,
      });
    });
  }

  return notices;
}

export const crawlNamgu: SourceCrawler = async (source) => {
  const [boardNotices, searchNotices] = await Promise.all([
    crawlGenericBoard(source),
    crawlNamguSearch(source),
  ]);
  const unique = new Map<string, CrawledNotice>();

  for (const notice of [...boardNotices, ...searchNotices]) {
    unique.set(`${notice.title}::${notice.originalUrl}`, notice);
  }

  return Array.from(unique.values());
};
