export type RegionKey = "namgu" | "junggu" | "bukgu" | "donggu";

export type NoticeSource = {
  region: RegionKey;
  regionLabel: string;
  name: string;
  url: string;
  enabled: boolean;
};

export const REGION_LABELS: Record<RegionKey | "all", string> = {
  all: "전체",
  namgu: "남구",
  junggu: "중구",
  bukgu: "북구",
  donggu: "동구",
};

export const SOURCES: NoticeSource[] = [
  {
    region: "namgu",
    regionLabel: "남구",
    name: "울산광역시 남구청 고시공고",
    url: "https://www.ulsannamgu.go.kr/cmm/main/mainPage.do",
    enabled: true,
  },
  {
    region: "junggu",
    regionLabel: "중구",
    name: "울산광역시 중구청 고시공고",
    url: "https://www.junggu.ulsan.kr/index.ulsan",
    enabled: true,
  },
  {
    region: "bukgu",
    regionLabel: "북구",
    name: "울산광역시 북구청 고시공고",
    url: "https://www.bukgu.ulsan.kr/index.do",
    enabled: true,
  },
  {
    region: "donggu",
    regionLabel: "동구",
    name: "울산광역시 동구청 고시공고",
    url: "https://www.donggu.ulsan.kr/",
    enabled: true,
  },
];
