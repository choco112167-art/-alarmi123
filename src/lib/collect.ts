import { SOURCES } from "@/config/sources";
import { getPrisma } from "@/lib/prisma";
import { createContentHash } from "@/lib/crawlers/generic";
import { crawlers } from "@/lib/crawlers";

export async function collectNotices() {
  const prisma = getPrisma();
  const results = [];

  for (const source of SOURCES.filter((item) => item.enabled)) {
    const startedAt = new Date();
    let foundCount = 0;
    let savedCount = 0;

    try {
      await prisma.source.upsert({
        where: {
          region_name: {
            region: source.region,
            name: source.name,
          },
        },
        update: {
          url: source.url,
          enabled: source.enabled,
        },
        create: {
          region: source.region,
          name: source.name,
          url: source.url,
          enabled: source.enabled,
        },
      });

      const notices = await crawlers[source.region](source);
      foundCount = notices.length;

      for (const notice of notices) {
        const contentHash = createContentHash([
          notice.title,
          notice.originalUrl,
          notice.contentText,
          notice.attachmentUrls.join(","),
        ]);

        const saved = await prisma.notice.upsert({
          where: {
            title_sourceRegion_originalUrl: {
              title: notice.title,
              sourceRegion: notice.source.region,
              originalUrl: notice.originalUrl,
            },
          },
          update: {
            summary: notice.summary,
            contentText: notice.contentText,
            attachmentUrls: notice.attachmentUrls,
            publishedAt: notice.publishedAt,
            deadline: notice.deadline,
            matchedKeywords: notice.matchedKeywords,
            contentHash,
          },
          create: {
            sourceRegion: notice.source.region,
            sourceName: notice.source.name,
            title: notice.title,
            summary: notice.summary,
            contentText: notice.contentText,
            originalUrl: notice.originalUrl,
            attachmentUrls: notice.attachmentUrls,
            publishedAt: notice.publishedAt,
            deadline: notice.deadline,
            matchedKeywords: notice.matchedKeywords,
            contentHash,
          },
        });

        if (saved.createdAt.getTime() === saved.updatedAt.getTime()) {
          savedCount += 1;
        }
      }

      await prisma.crawlLog.create({
        data: {
          sourceName: source.name,
          status: "success",
          message: "수집 완료",
          foundCount,
          savedCount,
          startedAt,
          finishedAt: new Date(),
        },
      });

      results.push({ source: source.name, status: "success", foundCount, savedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      await prisma.crawlLog.create({
        data: {
          sourceName: source.name,
          status: "failed",
          message,
          foundCount,
          savedCount,
          startedAt,
          finishedAt: new Date(),
        },
      });

      results.push({ source: source.name, status: "failed", foundCount, savedCount, message });
    }
  }

  return results;
}
