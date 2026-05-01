export function parseKoreanDate(value?: string | null) {
  if (!value) return null;

  const cleaned = value.trim().replace(/\./g, "-").replace(/\//g, "-");
  const match = cleaned.match(/(20\d{2})-?\s*(\d{1,2})-?\s*(\d{1,2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export function findDeadline(text: string) {
  const patterns = [
    /(?:신청기간|접수기간|공고기간)[\s\S]{0,40}?(20\d{2}[./-]\s*\d{1,2}[./-]\s*\d{1,2})\s*(?:까지|~|-|부터)?\s*(20\d{2}[./-]\s*\d{1,2}[./-]\s*\d{1,2})?/,
    /(?:마감일|마감|기한)[\s:：-]{0,8}(20\d{2}[./-]\s*\d{1,2}[./-]\s*\d{1,2})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseKoreanDate(match[2] || match[1]);
    }
  }

  return null;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "날짜 없음";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
