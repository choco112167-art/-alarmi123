export const INCLUDE_KEYWORDS = [
  "공동주택",
  "공동 주택",
  "공동주택 지원사업",
  "공용시설 유지보수",
  "보조금",
  "선정결과",
  "심의결과",
  "지원대상",
  "건축위원회",
  "공동주택관리",
];

const EXCLUDE_KEYWORDS = [
  "분양",
  "전세자금",
  "청년",
  "임대주택",
  "영구임대",
  "매입임대",
  "청년월세",
  "장애인 주택개조",
  "개별주택가격",
  "주택가격",
  "공동주택가격",
  "재산세",
  "민간임대주택",
];

const EXCLUDE_OVERRIDES = [
  "공동주택 지원사업",
  "공동주택지원사업",
  "공동주택 지원사업 신청",
  "공동주택 지원사업 선정결과",
  "공동주택지원사업 지원결과",
  "심의결과",
];

export function getMatchedKeywords(text: string) {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  return INCLUDE_KEYWORDS.filter((keyword) =>
    normalized.includes(keyword.toLowerCase()) ||
    compact.includes(keyword.toLowerCase().replace(/\s+/g, "")),
  );
}

export function shouldKeepNotice(title: string, content = "") {
  const searchable = `${title} ${content}`;
  const matchedKeywords = getMatchedKeywords(searchable);

  if (matchedKeywords.length === 0) {
    return { keep: false, matchedKeywords };
  }

  const normalizedTitle = title.replace(/\s+/g, " ").toLowerCase();
  const compactTitle = normalizedTitle.replace(/\s+/g, "");
  const normalizedSearchable = searchable.replace(/\s+/g, " ").toLowerCase();
  const compactSearchable = normalizedSearchable.replace(/\s+/g, "");

  const hasOverride = EXCLUDE_OVERRIDES.some((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();
    const compactKeyword = normalizedKeyword.replace(/\s+/g, "");
    return (
      normalizedTitle.includes(normalizedKeyword) ||
      compactTitle.includes(compactKeyword)
    );
  });
  const hasExcludedKeyword = EXCLUDE_KEYWORDS.some((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();
    const compactKeyword = normalizedKeyword.replace(/\s+/g, "");
    return (
      normalizedSearchable.includes(normalizedKeyword) ||
      compactSearchable.includes(compactKeyword)
    );
  });

  return {
    keep: hasOverride || !hasExcludedKeyword,
    matchedKeywords,
  };
}
