import { REGION_LABELS } from "@/config/sources";
import { formatDate } from "@/lib/dates";

type RssNotice = {
  title: string;
  originalUrl: string;
  publishedAt: Date | null;
  sourceRegion: string;
  summary: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssXml(notices: RssNotice[], region?: string | null) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    "https://example.com";
  const regionLabel =
    region && region !== "all"
      ? REGION_LABELS[region as keyof typeof REGION_LABELS] || region
      : "울산 남구/중구/북구/동구";

  const items = notices
    .map((notice) => {
      const description = `${REGION_LABELS[notice.sourceRegion as keyof typeof REGION_LABELS] || notice.sourceRegion} | ${notice.summary || ""}`;
      const pubDate = notice.publishedAt
        ? notice.publishedAt.toUTCString()
        : new Date().toUTCString();

      return `
        <item>
          <title>${escapeXml(notice.title)}</title>
          <link>${escapeXml(notice.originalUrl)}</link>
          <guid isPermaLink="true">${escapeXml(notice.originalUrl)}</guid>
          <pubDate>${pubDate}</pubDate>
          <category>${escapeXml(regionLabel)}</category>
          <description>${escapeXml(description)}</description>
        </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(regionLabel)} 공동주택 공고</title>
    <link>${escapeXml(appUrl)}</link>
    <description>${escapeXml(`${regionLabel} 공동주택 관련 공고 RSS`)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Namgu Notice Alert MVP</generator>
    ${items}
  </channel>
</rss>`;
}

export function getReadableRssDate(value: Date | null) {
  return formatDate(value);
}
