# 울산 공동주택 공고 알림

울산광역시 남구, 중구, 북구, 동구 구청의 공동주택 관련 공고를 모아 보여주는 개인용 Next.js 앱입니다. 이용자는 1명이고 공고 빈도도 낮기 때문에 Railway, Supabase, PostgreSQL, Prisma를 사용하지 않습니다. 데이터는 `data/notices.json` 파일에 저장하고, GitHub Actions가 하루 2회 공고를 확인해 새 공고가 있으면 자동 commit/push합니다. Vercel은 GitHub push를 감지해 자동 재배포합니다.

## 기능

- 모바일 우선 공고 목록
- 지역 필터: 전체, 남구, 중구, 북구, 동구
- 검색창
- 공고 카드: 제목, 지역, 게시일, 발견일, 출처 구청, 매칭 키워드, 원문 링크
- 공고 클릭 시 구청 원문 URL 새 탭 열기
- RSS 제공: `/api/rss`, `/api/rss?region=namgu`
- 선택 기능: GitHub Actions Secrets가 있으면 Telegram 알림 발송

## 구조

```text
data/notices.json                 # 저장된 공고 데이터
public/rss.xml                    # GitHub Actions가 갱신하는 정적 RSS 파일
scripts/check-notices.ts          # 수동/스케줄 수집 스크립트
.github/workflows/check-notices.yml
src/app/api/notices/route.ts      # JSON API
src/app/api/rss/route.ts          # RSS API
src/app/admin/page.tsx            # JSON 기준 관리 화면
src/components/notice-browser.tsx # 메인 UI
src/config/sources.ts             # 구청 URL 설정
src/lib/crawlers/                 # 구청별 크롤러
src/lib/keywords.ts               # 포함/제외 키워드
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 수동 수집

```bash
npm run check
```

새 공고가 발견되면 `data/notices.json`과 `public/rss.xml`이 갱신됩니다. `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`가 없으면 Telegram 알림은 건너뛰며 실패하지 않습니다.

## GitHub Repository Push

원격 저장소:

```text
https://github.com/choco112167-art/-alarmi123
```

처음 연결하거나 원격을 맞출 때:

```bash
git remote add origin https://github.com/choco112167-art/-alarmi123.git
git branch -M main
git add .
git commit -m "Switch notices app to Vercel JSON storage"
git push -u origin main
```

이미 `origin`이 있다면:

```bash
git remote set-url origin https://github.com/choco112167-art/-alarmi123.git
git add .
git commit -m "Switch notices app to Vercel JSON storage"
git push
```

## Vercel 배포

1. Vercel Dashboard 접속
2. New Project 선택
3. Import Git Repository 선택
4. `choco112167-art/-alarmi123` 선택
5. Framework Preset은 Next.js 유지
6. Deploy 클릭

Vercel은 GitHub push가 발생할 때 자동으로 재배포합니다. 수집은 Vercel Cron이 아니라 GitHub Actions가 담당합니다.

Vercel 환경변수는 선택값만 사용합니다.

```text
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_DOMAIN
```

## GitHub Actions 설정

워크플로우 파일은 `.github/workflows/check-notices.yml`입니다.

- 하루 2회 실행: UTC 00:00, 12:00
- 수동 실행: GitHub Actions 탭에서 `Check notices` 선택 후 `Run workflow`
- 실행 내용: `npm ci`, `npm run check`, 변경된 `data/notices.json` 또는 `public/rss.xml` 자동 commit/push

## GitHub Actions Secrets

Telegram 알림을 쓰려면 GitHub repository의 Settings > Secrets and variables > Actions에 아래 Secrets를 추가합니다.

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

이 값들은 Vercel 환경변수가 아니라 GitHub Actions Secrets에 넣습니다. 두 값이 없어도 수집 워크플로우는 실패하지 않습니다.

선택적으로 repository variable에 공개 URL을 넣을 수 있습니다.

```text
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_DOMAIN
```

## RSS 주소

```text
https://YOUR_VERCEL_DOMAIN/api/rss
https://YOUR_VERCEL_DOMAIN/api/rss?region=namgu
https://YOUR_VERCEL_DOMAIN/api/rss?region=junggu
https://YOUR_VERCEL_DOMAIN/api/rss?region=bukgu
https://YOUR_VERCEL_DOMAIN/api/rss?region=donggu
```

## npm Scripts

```bash
npm run dev      # 로컬 개발 서버
npm run build    # Vercel production build 확인
npm run start    # production 서버 실행
npm run lint     # ESLint
npm run check    # 구청 공고 확인 후 JSON/RSS 갱신
```

## 데이터 정책

- DB를 사용하지 않고 `data/notices.json`만 사용합니다.
- 원문 URL만 저장합니다.
- 첨부파일 저장, 본문 재배포, AI 요약은 하지 않습니다.
- 개인정보 입력 기능은 없습니다.
- 구청 사이트 요청에는 User-Agent와 요청 간 딜레이를 적용합니다.
- 크롤링 실패는 구청별로 처리해 전체 워크플로우가 죽지 않게 합니다.
