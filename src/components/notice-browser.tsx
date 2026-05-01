"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { REGION_LABELS, type RegionKey } from "@/config/sources";
import { formatDate } from "@/lib/dates";

type Notice = {
  id: string;
  sourceRegion: RegionKey;
  sourceName: string;
  title: string;
  originalUrl: string;
  publishedAt: string | null;
  detectedAt: string;
  matchedKeywords: string[];
};

const regions: Array<RegionKey | "all"> = ["all", "namgu", "junggu", "bukgu", "donggu"];

export function NoticeBrowser() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [region, setRegion] = useState<RegionKey | "all">("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (region !== "all") params.set("region", region);
        if (query.trim()) params.set("q", query.trim());

        const response = await fetch(`/api/notices?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "공고를 불러오지 못했습니다.");
        setNotices(Array.isArray(data.notices) ? data.notices : []);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    const timer = window.setTimeout(load, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [region, query]);

  const rssUrl = useMemo(
    () => `/api/rss${region === "all" ? "" : `?region=${region}`}`,
    [region],
  );

  return (
    <main className="min-h-screen bg-white text-[#17191f]">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8 sm:px-8 sm:py-12">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3ff] px-3 py-1.5 text-sm font-bold text-[#1b64da]">
            <ShieldCheck size={16} />
            울산 공동주택 공고 알림
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            공동주택 공고를 한곳에서 빠르게 확인하세요
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#6b7684]">
            남구, 중구, 북구, 동구 구청 공고 중 공동주택 지원사업과 보조금,
            심의결과 관련 소식을 모아 RSS로도 제공합니다.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-5 bg-white/92 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {regions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                className={`h-11 shrink-0 rounded-full px-5 text-sm font-bold transition ${
                  region === item
                    ? "bg-[#3182f6] text-white shadow-[0_8px_18px_rgba(49,130,246,0.28)]"
                    : "bg-[#f2f4f6] text-[#4e5968]"
                }`}
              >
                {REGION_LABELS[item]}
              </button>
            ))}
          </div>

          <label className="mt-2 flex h-14 items-center gap-3 rounded-[18px] bg-[#f2f4f6] px-4">
            <Search size={20} className="text-[#8b95a1]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="키워드나 제목으로 검색"
              className="h-full flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[#8b95a1]"
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#6b7684]">
            {isLoading ? "불러오는 중" : `총 ${notices.length}건`}
          </p>
          <a
            href={rssUrl}
            className="inline-flex h-10 items-center rounded-full bg-[#e8f3ff] px-4 text-sm font-bold text-[#1b64da]"
          >
            RSS
          </a>
        </div>

        {isLoading ? <NoticeSkeleton /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && notices.length === 0 ? <EmptyState /> : null}

        {!isLoading && !error ? (
          <div className="flex flex-col gap-4">
            {notices.map((notice) => (
              <a
                key={notice.id}
                href={notice.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-[26px] bg-white p-5 shadow-[0_14px_36px_rgba(0,27,55,0.10)] ring-1 ring-[#edf0f3]"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#f2f4f6] px-3 py-1 text-xs font-bold text-[#4e5968]">
                    {REGION_LABELS[notice.sourceRegion]}
                  </span>
                  <span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-bold text-[#1b64da]">
                    {notice.sourceName}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-black leading-8 tracking-tight">
                  {notice.title}
                </h2>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="font-semibold text-[#8b95a1]">게시일</dt>
                    <dd className="mt-1 font-bold">{formatDate(notice.publishedAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#8b95a1]">발견일</dt>
                    <dd className="mt-1 font-bold">{formatDate(notice.detectedAt)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {notice.matchedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-[#f2f4f6] px-3 py-1 text-xs font-bold text-[#4e5968]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#3182f6] px-4 text-sm font-bold text-white">
                  <ExternalLink size={18} />
                  원문 보기
                </div>
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function NoticeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-[26px] bg-[#f2f4f6]"
        />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] bg-[#fff0f0] p-6 text-center">
      <p className="font-bold text-[#e5484d]">불러오기 실패</p>
      <p className="mt-2 text-sm leading-6 text-[#6b7684]">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[24px] bg-[#f7f9fc] p-8 text-center">
      <p className="text-lg font-black">표시할 공고가 없습니다</p>
      <p className="mt-2 text-sm leading-6 text-[#6b7684]">
        수집을 실행했거나 검색 조건을 바꾼 뒤 다시 확인해 주세요.
      </p>
    </div>
  );
}
