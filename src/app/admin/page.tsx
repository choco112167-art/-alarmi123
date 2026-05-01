import Link from "next/link";
import { BarChart3, CalendarClock, Home, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { getNoticeStats, readNotices } from "@/lib/notice-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const notices = await readNotices();
  const stats = getNoticeStats(notices);

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#17191f]">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#3182f6]">관리자</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">데이터 상태</h1>
            <p className="mt-3 text-base leading-7 text-[#6b7684]">
              GitHub Actions가 갱신하는 notices.json 기준으로 공고 현황을 확인합니다.
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
            <Newspaper className="text-[#3182f6]" size={24} />
            <p className="mt-4 text-sm font-medium text-[#8b95a1]">총 공고 수</p>
            <p className="mt-2 text-3xl font-black">{stats.total}건</p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
            <CalendarClock className="text-[#3182f6]" size={24} />
            <p className="mt-4 text-sm font-medium text-[#8b95a1]">최근 발견일</p>
            <p className="mt-2 text-3xl font-black">
              {stats.latestDetectedAt ? formatDate(stats.latestDetectedAt) : "없음"}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
          <div className="flex items-center gap-2 font-bold">
            <BarChart3 size={18} className="text-[#3182f6]" />
            지역별 공고 수
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.byRegion.map((item) => (
              <div key={item.region} className="rounded-[18px] bg-[#f7f9fc] p-4">
                <p className="text-sm font-semibold text-[#8b95a1]">{item.label}</p>
                <p className="mt-2 text-2xl font-black">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_12px_32px_rgba(0,27,55,0.08)]">
          <div className="border-b border-[#edf0f3] px-5 py-4 font-bold">
            최근 공고 5개
          </div>
          <div className="divide-y divide-[#edf0f3]">
            {stats.recent.length ? (
              stats.recent.map((notice) => (
                <a
                  key={notice.id}
                  href={notice.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-5 py-4 transition hover:bg-[#f7f9fc]"
                >
                  <h2 className="font-semibold leading-6">{notice.title}</h2>
                  <p className="mt-2 text-sm text-[#6b7684]">
                    {notice.sourceName} · 발견 {formatDate(notice.detectedAt)}
                  </p>
                </a>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-[#8b95a1]">
                아직 저장된 공고가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
