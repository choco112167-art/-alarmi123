export type RegionKey = "namgu" | "junggu" | "bukgu" | "donggu";

export type NoticeSource = {
  region: RegionKey;
  regionLabel: string;
  name: string;
  url: string;
  searchUrls?: string[];
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
    url: "https://www.ulsannamgu.go.kr/cop/bbs/selectSaeolGosiList.do",
    searchUrls: [
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EC%A3%BC%ED%83%9D&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EA%B3%B5%EB%8F%99%EC%A3%BC%ED%83%9D&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EA%B3%B5%EB%8F%99%20%EC%A3%BC%ED%83%9D&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EC%84%A0%EC%A0%95%EA%B2%B0%EA%B3%BC&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
      "https://www.ulsannamgu.go.kr/easyMain/search.do?qt=%EC%8B%AC%EC%9D%98%EA%B2%B0%EA%B3%BC&menu=%EB%82%A8%EA%B5%AC%EC%86%8C%EC%8B%9D",
    ],
    enabled: true,
  },
  {
    region: "junggu",
    regionLabel: "중구",
    name: "울산광역시 중구청 고시공고",
    url: "https://www.junggu.ulsan.kr/index.ulsan?menuCd=DOM_000000102004001000",
    enabled: true,
  },
  {
    region: "bukgu",
    regionLabel: "북구",
    name: "울산광역시 북구청 고시공고",
    url: "https://www.bukgu.ulsan.kr/lay1/S1T1903C86/sublink.do",
    enabled: true,
  },
  {
    region: "donggu",
    regionLabel: "동구",
    name: "울산광역시 동구청 고시공고",
    url: "https://www.donggu.ulsan.kr/donggu/dongguNews/gosi/contents.do",
    enabled: true,
  },
];
