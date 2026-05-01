import { promises as fs } from "node:fs";
import path from "node:path";
import { REGION_LABELS, type RegionKey } from "@/config/sources";
import type { StoredNotice } from "@/lib/notice-types";
import { seedNotices } from "@/lib/seed-notices";

const noticesPath = path.join(process.cwd(), "data", "notices.json");

export async function readNotices() {
  try {
    const raw = await fs.readFile(noticesPath, "utf-8");
    const notices = JSON.parse(raw) as StoredNotice[];
    if (!Array.isArray(notices) || notices.length === 0) {
      console.warn(
        `No notices found in ${noticesPath}. Falling back to seed notices.`,
      );
      return sortNotices(seedNotices);
    }

    return sortNotices(notices);
  } catch (error) {
    console.error(`Failed to read notices from ${noticesPath}.`, error);
    return sortNotices(seedNotices);
  }
}

export function filterNotices(
  notices: StoredNotice[],
  region?: string | null,
  search?: string | null,
) {
  const normalizedRegion = region && region !== "all" ? region : null;
  const normalizedSearch = search?.trim().toLowerCase();

  return notices.filter((notice) => {
    const regionMatches =
      !normalizedRegion || notice.sourceRegion === normalizedRegion;
    const searchMatches =
      !normalizedSearch ||
      [notice.title, notice.sourceName, ...notice.matchedKeywords]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return regionMatches && searchMatches;
  });
}

export function getNoticeStats(notices: StoredNotice[]) {
  const byRegion = (["namgu", "junggu", "bukgu", "donggu"] as RegionKey[]).map(
    (region) => ({
      region,
      label: REGION_LABELS[region],
      count: notices.filter((notice) => notice.sourceRegion === region).length,
    }),
  );

  return {
    total: notices.length,
    byRegion,
    latestDetectedAt: sortNotices(notices)[0]?.detectedAt ?? null,
    recent: sortNotices(notices).slice(0, 5),
  };
}

export function sortNotices(notices: StoredNotice[]) {
  return [...notices].sort((a, b) => {
    const aTime = new Date(a.publishedAt || a.detectedAt).getTime();
    const bTime = new Date(b.publishedAt || b.detectedAt).getTime();
    return bTime - aTime;
  });
}
