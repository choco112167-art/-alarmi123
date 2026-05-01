import { getPrisma } from "@/lib/prisma";

export async function listNotices(region?: string | null, search?: string | null) {
  const prisma = getPrisma();
  const normalizedRegion = region && region !== "all" ? region : undefined;

  return prisma.notice.findMany({
    where: {
      sourceRegion: normalizedRegion,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
            { contentText: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ publishedAt: "desc" }, { detectedAt: "desc" }],
    take: 100,
  });
}

export async function listCrawlLogs() {
  const prisma = getPrisma();

  const [logs, lastSuccess] = await Promise.all([
    prisma.crawlLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 30,
    }),
    prisma.crawlLog.findFirst({
      where: { status: "success" },
      orderBy: { finishedAt: "desc" },
    }),
  ]);

  return { logs, lastSuccess };
}
