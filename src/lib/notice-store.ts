import { promises as fs } from "node:fs";
import path from "node:path";
import { REGION_LABELS, type RegionKey } from "@/config/sources";
import type { StoredNotice } from "@/lib/notice-types";

const noticesPath = path.join(process.cwd(), "data", "notices.json");

export async function readNotices() {
  try {
    const raw = await fs.readFile(noticesPath, "utf-8");
    const notices = JSON.parse(raw) as StoredNotice[];
    return sortNotices(notices);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
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
