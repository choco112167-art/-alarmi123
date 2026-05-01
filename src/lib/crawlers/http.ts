const USER_AGENT =
  "NamguNoticeAlert/0.1 (+https://railway.app; apartment-notice-rss-mvp)";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}`);
  }

  return response.text();
}
