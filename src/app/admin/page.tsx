import Link from "next/link";
import { Clock, Database, Home, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { listCrawlLogs } from "@/lib/notices";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let data: Awaited<ReturnType<typeof listCrawlLogs>> | null = null;
  let error = "";

  try {
    data = await listCrawlLogs();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "관리자 데이터를 불러오지 못했습니다.";
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17191f]">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#3182f6]">관리자</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">수집 상태</h1>
            <p className="mt-3 text-base leading-7 text-[#6b7684]">
              구청별 크롤링 로그와 마지막 성공 시간을 확인합니다.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#333d4b] shadow-sm ring-1 ring-[#e5e8eb]"
          >
            <Home size={18} />
            홈
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
            <Clock className="text-[#3182f6]" size={24} />
            <p className="mt-4 text-sm font-medium text-[#8b95a1]">마지막 성공 수집</p>
            <p className="mt-2 text-xl font-bold">
              {data?.lastSuccess?.finishedAt
                ? formatDate(data.lastSuccess.finishedAt)
                : "기록 없음"}
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
            <Database className="text-[#3182f6]" size={24} />
            <p className="mt-4 text-sm font-medium text-[#8b95a1]">최근 로그</p>
            <p className="mt-2 text-xl font-bold">{data?.logs.length ?? 0}건</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] bg-white p-6 text-[#e5484d] shadow-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
            <div className="flex items-center gap-2 border-b border-[#edf0f3] px-5 py-4 font-bold">
              <RefreshCw size={18} className="text-[#3182f6]" />
              수집 로그
            </div>
            <div className="divide-y divide-[#edf0f3]">
              {data?.logs.length ? (
                data.logs.map((log) => (
                  <article key={log.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold">{log.sourceName}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          log.status === "success"
                            ? "bg-[#e8f3ff] text-[#1b64da]"
                            : "bg-[#fff0f0] text-[#e5484d]"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#6b7684]">
                      발견 {log.foundCount}건 · 저장 {log.savedCount}건 ·{" "}
                      {formatDate(log.startedAt)}
                    </p>
                    {log.message ? (
                      <p className="mt-2 text-sm leading-6 text-[#4e5968]">{log.message}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-[#8b95a1]">
                  아직 수집 로그가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
