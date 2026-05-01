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

const EXCLUDE_KEYWORDS = ["분양", "전세자금", "청년", "임대주택"];
const EXCLUDE_OVERRIDES = ["공동주택 지원사업", "심의결과"];

export function getMatchedKeywords(text: string) {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  return INCLUDE_KEYWORDS.filter((keyword) =>
    normalized.includes(keyword.toLowerCase()),
  );
}

export function shouldKeepNotice(title: string, content = "") {
  const searchable = `${title} ${content}`;
  const matchedKeywords = getMatchedKeywords(searchable);

  if (matchedKeywords.length === 0) {
    return { keep: false, matchedKeywords };
  }

  const hasOverride = EXCLUDE_OVERRIDES.some((keyword) =>
    title.includes(keyword),
  );
  const hasExcludedKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
    title.includes(keyword),
  );

  return {
    keep: hasOverride || !hasExcludedKeyword,
    matchedKeywords,
  };
}
