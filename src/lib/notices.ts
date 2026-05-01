import { filterNotices, readNotices } from "@/lib/notice-store";

export async function listNotices(region?: string | null, search?: string | null) {
  const notices = await readNotices();
  return filterNotices(notices, region, search).slice(0, 100);
}
