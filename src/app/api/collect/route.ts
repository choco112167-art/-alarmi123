import { NextResponse } from "next/server";
import { collectNotices } from "@/lib/collect";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");

  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Configure CRON_SECRET and pass it as a Bearer token." },
      { status: 401 },
    );
  }

  try {
    const results = await collectNotices();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "수집 실패",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
