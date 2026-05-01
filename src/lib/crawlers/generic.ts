import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { shouldKeepNotice } from "@/lib/keywords";
import { parseKoreanDate } from "@/lib/dates";
import type { CrawledNotice, ListItem } from "./types";
import type { NoticeSource } from "@/config/sources";
import { delay, fetchHtml } from "./http";

function absoluteUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function extractNearbyDate($: cheerio.CheerioAPI, anchor: Element) {
  const rowText = normalizeText($(anchor).closest("tr, li, div").text());
  return parseKoreanDate(rowText);
}

export async function crawlGenericBoard(source: NoticeSource) {
  const html = await fetchHtml(source.url);
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const items: ListItem[] = [];

  $("a[href]").each((_, anchor) => {
    const title = normalizeText($(anchor).text());
    const href = $(anchor).attr("href");
    if (!href || title.length < 4 || title.length > 180) return;
    if (/더보기|검색|로그인|사이트맵|바로가기|채용/.test(title)) return;

    const url = absoluteUrl(href, source.url);
    if (!url || seen.has(url)) return;

    const hasNoticeShape =
      /view|board|bbs|notice|ancmt|seq|no=/i.test(url) ||
      /공고|고시|알림|공동|주택|보조금|결과/.test(title);

    if (!hasNoticeShape) return;

    const publishedAt = extractNearbyDate($, anchor);
    if (!publishedAt) return;

    seen.add(url);
    items.push({
      title,
      detailUrl: url,
      publishedAt,
    });
  });

  const candidates = items.slice(0, 30);
  const notices: CrawledNotice[] = [];

  for (const item of candidates) {
    await delay(500);
    let detail: Awaited<ReturnType<typeof fetchDetailPage>>;

    try {
      detail = await fetchDetailPage(item.detailUrl);
    } catch {
      continue;
    }

    const contentText = detail.contentText || item.title;
    const titleResult = shouldKeepNotice(item.title);
    const contentResult = shouldKeepNotice(item.title, contentText);
    const titleLooksLikeNotice = /공고|고시|공시|선정|심의|지원|보조금|공동주택|주택/.test(
      item.title,
    );
    const keep = titleResult.keep || (titleLooksLikeNotice && contentResult.keep);
    const matchedKeywords = Array.from(
      new Set([...titleResult.matchedKeywords, ...contentResult.matchedKeywords]),
    );

    if (!keep) continue;

    notices.push({
      source,
      title: item.title,
      originalUrl: item.detailUrl,
      publishedAt: item.publishedAt,
      matchedKeywords,
    });
  }

  return notices;
}

export async function fetchDetailPage(url: string) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  $("script, style, nav, header, footer").remove();

  const contentText = normalizeText(
    $(".board_view, .view, .contents, .content, article, main").first().text() ||
      $("body").text(),
  );

  const attachmentUrls = new Set<string>();
  $("a[href]").each((_, anchor) => {
    const href = $(anchor).attr("href");
    const label = normalizeText($(anchor).text());
    if (!href) return;

    const looksLikeFile =
      /download|file|atch|attach/i.test(href) ||
      /\.(pdf|hwp|hwpx|doc|docx|xls|xlsx|zip)$/i.test(href) ||
      /첨부|다운로드|파일/.test(label);

    if (!looksLikeFile) return;
    const fullUrl = absoluteUrl(href, url);
    if (fullUrl) attachmentUrls.add(fullUrl);
  });

  return {
    contentText,
    attachmentUrls: Array.from(attachmentUrls),
  };
}
