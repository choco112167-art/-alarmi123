import { NextResponse } from "next/server";
import { listNotices } from "@/lib/notices";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const notices = await listNotices(
      searchParams.get("region"),
      searchParams.get("q"),
    );

    return NextResponse.json(
      { notices },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        notices: [],
        error: error instanceof Error ? error.message : "공고 목록 조회 실패",
      },
      { status: 500 },
    );
  }
}
