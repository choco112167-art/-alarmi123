import { listNotices } from "@/lib/notices";
import { buildRssXml } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  try {
    const notices = await listNotices(region);
    return new Response(buildRssXml(notices, region), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return new Response(
      buildRssXml([], region).replace(
        "</description>",
        ` 조회 실패: ${error instanceof Error ? error.message : "unknown"}</description>`,
      ),
      {
        status: 500,
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
      },
    );
  }
}
