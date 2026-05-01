import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SOURCES } from "../src/config/sources";
import { crawlers } from "../src/lib/crawlers";
import { sortNotices } from "../src/lib/notice-store";
import type { StoredNotice } from "../src/lib/notice-types";
import { buildRssXml } from "../src/lib/rss";

const dataDir = path.join(process.cwd(), "data");
const publicDir = path.join(process.cwd(), "public");
const noticesPath = path.join(dataDir, "notices.json");
const rssPath = path.join(publicDir, "rss.xml");

function noticeKey(notice: Pick<StoredNotice, "title" | "sourceRegion" | "originalUrl">) {
  return `${notice.title}::${notice.sourceRegion}::${notice.originalUrl}`;
}

function createNoticeId(notice: Pick<StoredNotice, "title" | "sourceRegion" | "originalUrl">) {
  return crypto.createHash("sha256").update(noticeKey(notice)).digest("hex").slice(0, 16);
}

async function readExistingNotices() {
  try {
    const raw = await fs.readFile(noticesPath, "utf-8");
    return JSON.parse(raw) as StoredNotice[];
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

async function writeJsonNotices(notices: StoredNotice[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(noticesPath, `${JSON.stringify(sortNotices(notices), null, 2)}\n`);
}

async function writeRss(notices: StoredNotice[]) {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(rssPath, buildRssXml(sortNotices(notices)));
}

async function sendTelegram(newNotices: StoredNotice[]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || newNotices.length === 0) {
    return;
  }

  for (const notice of newNotices) {
    const text = [
      "새 공동주택 공고가 발견되었습니다.",
      "",
      `[${notice.sourceName}] ${notice.title}`,
      notice.originalUrl,
    ].join("\n");

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        console.warn(`Telegram notification skipped: ${response.status}`);
      }
    } catch (error) {
      console.warn(
        `Telegram notification skipped: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}

async function main() {
  const existing = await readExistingNotices();
  const known = new Set(existing.map(noticeKey));
  const detectedAt = new Date().toISOString();
  const newNotices: StoredNotice[] = [];

  for (const source of SOURCES.filter((item) => item.enabled)) {
    try {
      const crawled = await crawlers[source.region](source);

      for (const item of crawled) {
        const draft: StoredNotice = {
          id: "",
          sourceRegion: source.region,
          sourceName: source.name,
          title: item.title,
          originalUrl: item.originalUrl,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          detectedAt,
          matchedKeywords: item.matchedKeywords,
        };

        draft.id = createNoticeId(draft);
        const key = noticeKey(draft);

        if (!known.has(key)) {
          known.add(key);
          newNotices.push(draft);
        }
      }

      console.log(`${source.name}: ${crawled.length} matching notices checked`);
    } catch (error) {
      console.warn(
        `${source.name}: skipped after crawler error - ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  const merged = sortNotices([...existing, ...newNotices]);
  const rssExists = await fs
    .access(rssPath)
    .then(() => true)
    .catch(() => false);

  if (newNotices.length > 0) {
    await writeJsonNotices(merged);
    await writeRss(merged);
    await sendTelegram(newNotices);
  } else if (!rssExists) {
    await writeRss(merged);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        existingCount: existing.length,
        newCount: newNotices.length,
        totalCount: merged.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
