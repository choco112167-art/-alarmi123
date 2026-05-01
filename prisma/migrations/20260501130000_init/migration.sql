CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "sourceRegion" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "contentText" TEXT,
    "originalUrl" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "matchedKeywords" TEXT[],
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrawlLog" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "foundCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CrawlLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Notice_title_sourceRegion_originalUrl_key" ON "Notice"("title", "sourceRegion", "originalUrl");
CREATE INDEX "Notice_sourceRegion_publishedAt_idx" ON "Notice"("sourceRegion", "publishedAt");
CREATE INDEX "Notice_detectedAt_idx" ON "Notice"("detectedAt");
CREATE UNIQUE INDEX "Source_region_name_key" ON "Source"("region", "name");
CREATE INDEX "CrawlLog_startedAt_idx" ON "CrawlLog"("startedAt");
