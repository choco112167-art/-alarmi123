# 울산 공동주택 공고 알림 MVP

울산광역시 남구, 중구, 북구, 동구 구청의 공동주택 관련 공고를 수집해 웹 UI, JSON API, RSS로 제공하는 Next.js MVP입니다. Railway 한 프로젝트 안에서 Next.js 웹앱/API/크롤러와 PostgreSQL을 함께 운영하도록 구성했습니다.

## 핵심 기능

- `/`: 모바일 우선 공고 목록, 지역 필터, 검색, 원문/첨부 링크
- `/admin`: 최근 수집 로그, 마지막 성공 수집 시간
- `/api/notices`: 공고 목록 JSON
- `/api/rss`: 전체 RSS XML
- `/api/rss?region=namgu`: 지역별 RSS XML
- `/api/collect`: `CRON_SECRET` Bearer 토큰으로 보호되는 수동 수집 API
- `npm run collect`: Railway Cron Job 또는 로컬 터미널에서 실행 가능한 수집 명령

## 파일 구조

```text
prisma/
  schema.prisma
  migrations/
src/
  app/
    admin/page.tsx
    api/collect/route.ts
    api/notices/route.ts
    api/rss/route.ts
    page.tsx
  components/notice-browser.tsx
  config/sources.ts
  lib/
    collect.ts
    crawlers/
    notices.ts
    prisma.ts
    rss.ts
  scripts/collect.ts
Dockerfile
railway.json
.env.example
```

## 로컬 실행

```bash
npm install
cp .env.example .env
npm run prisma:dev
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

## 로컬 수집

`.env`에 `DATABASE_URL`을 설정한 뒤 실행합니다.

```bash
npm run collect
```

수동 API 수집은 `CRON_SECRET`이 반드시 필요합니다.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/collect
```

## Railway 환경변수

Railway 서비스에 아래 값을 설정합니다.

```bash
DATABASE_URL="Railway PostgreSQL 플러그인이 제공하는 Postgres connection URL"
CRON_SECRET="충분히 긴 임의 문자열"
NEXT_PUBLIC_APP_URL="https://YOUR_RAILWAY_DOMAIN"
```

- `DATABASE_URL`: Prisma가 사용하는 PostgreSQL 연결 문자열입니다. Railway PostgreSQL을 같은 프로젝트에 추가한 뒤 서비스 변수로 참조합니다.
- `CRON_SECRET`: `/api/collect` 보호용입니다. 값이 없으면 수집 API는 항상 401을 반환합니다.
- `NEXT_PUBLIC_APP_URL`: RSS channel link와 배포 후 확인 명령에 사용할 앱 공개 URL입니다.

## Railway 배포 절차

CLI가 설치되어 있지 않으면 먼저 설치합니다.

```bash
npm install -g @railway/cli
```

로그인과 프로젝트 연결:

```bash
railway login
railway init
railway link
```

Railway PostgreSQL을 같은 프로젝트에 추가한 뒤 앱 서비스 변수에 연결합니다.

```bash
railway add --database postgresql
railway variables set CRON_SECRET="충분히-긴-임의-문자열"
railway variables set NEXT_PUBLIC_APP_URL="https://YOUR_RAILWAY_DOMAIN"
```

`DATABASE_URL`은 Railway PostgreSQL 서비스가 제공하는 값을 앱 서비스 Variables에 연결합니다. Railway 대시보드에서 PostgreSQL의 `DATABASE_URL`을 앱 서비스 변수로 참조하거나 복사해 설정합니다.

마이그레이션:

```bash
railway run npx prisma migrate deploy
```

배포:

```bash
railway up
```

배포 로그 확인:

```bash
railway logs
```

초기 수집:

```bash
railway run npm run collect
```

## Railway Cron Job

Railway Cron Job은 명령 실행 방식으로 설정하는 것을 권장합니다. 하루 2회 실행하려면 Railway 대시보드에서 앱 서비스에 Cron을 추가하고 다음처럼 설정합니다.

```text
Schedule: 0 0,12 * * *
Command: npm run collect
Timezone: UTC
```

한국시간 오전 9시와 오후 9시에 맞추려면 UTC 기준 0시와 12시에 실행합니다.

CLI 또는 대시보드에서 Cron을 별도 서비스로 운영하는 경우에도 같은 프로젝트의 `DATABASE_URL`을 사용할 수 있게 앱 서비스와 동일한 환경변수를 연결합니다.

```bash
npm run collect
```

Cron Job이 같은 Railway 서비스 환경변수를 사용하면 `DATABASE_URL`로 PostgreSQL에 연결합니다. HTTP 방식으로 호출한다면 반드시 아래처럼 Bearer 토큰을 넣습니다.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_RAILWAY_DOMAIN/api/collect
```

## 배포 후 확인 URL

```text
https://YOUR_RAILWAY_DOMAIN/
https://YOUR_RAILWAY_DOMAIN/admin
https://YOUR_RAILWAY_DOMAIN/api/notices
https://YOUR_RAILWAY_DOMAIN/api/rss
https://YOUR_RAILWAY_DOMAIN/api/rss?region=namgu
```

배포 후 확인 명령:

```bash
curl -I https://YOUR_RAILWAY_DOMAIN/
curl -I https://YOUR_RAILWAY_DOMAIN/admin
curl https://YOUR_RAILWAY_DOMAIN/api/notices
curl https://YOUR_RAILWAY_DOMAIN/api/rss
curl -i https://YOUR_RAILWAY_DOMAIN/api/collect
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_RAILWAY_DOMAIN/api/collect
```

`/api/collect`는 secret 없이 `401 Unauthorized`를 반환해야 합니다.

## npm scripts

```bash
npm run dev             # 로컬 개발 서버
npm run build           # Prisma generate 후 Next.js production build
npm run start           # Next.js standalone 서버 실행
npm run lint            # ESLint
npm run collect         # 크롤러 실행
npm run prisma:dev      # 로컬 개발 마이그레이션
npm run prisma:migrate  # 운영 마이그레이션 적용
```

## 크롤링/데이터 정책

- 수집 대상 URL은 `src/config/sources.ts`에서 관리합니다.
- 구청별 파서는 `src/lib/crawlers`에 분리되어 HTML 변경 시 해당 파일만 수정하면 됩니다.
- 요청에는 User-Agent와 요청 간 딜레이를 적용합니다.
- 소스별 try/catch로 한 구청 실패가 전체 수집을 중단하지 않게 했습니다.
- 중복 기준은 `title + sourceRegion + originalUrl`입니다.
- 원문과 첨부파일은 재배포하지 않고 구청 원본 URL만 저장합니다.
