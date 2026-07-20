import { watchlist, type WatchlistCompany } from "../../config/watchlist";
import type { DisclosureItem } from "../../types/market";

interface DartDisclosure {
  rcept_no: string;
  corp_code: string;
  corp_name: string;
  report_nm: string;
  rcept_dt: string;
}

interface DartResponse {
  status?: string;
  message?: string;
  list?: DartDisclosure[];
}

async function fetchDartResponse(url: string): Promise<DartResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`OpenDART 응답 오류: ${response.status}`);
      const payload = (await response.json()) as DartResponse;
      if (payload.status !== "000" && payload.status !== "013") {
        throw new Error(payload.message ?? "OpenDART 유효 응답 없음");
      }
      return payload;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function compactDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function filedAt(value: string) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00+09:00`;
}

async function fetchCompanyDisclosures(
  company: WatchlistCompany,
  apiKey: string,
): Promise<DisclosureItem[]> {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 30);
  const params = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: company.corpCode,
    bgn_de: compactDate(start),
    end_de: compactDate(end),
    sort: "date",
    sort_mth: "desc",
    page_count: "10",
  });
  const payload = await fetchDartResponse(`https://opendart.fss.or.kr/api/list.json?${params}`);
  if (payload.status === "013") return [];
  if (!payload.list) throw new Error(`OpenDART ${company.name} 유효 응답 없음`);
  return payload.list.map((item) => ({
    id: item.rcept_no,
    companyName: item.corp_name || company.name,
    ticker: company.ticker,
    corpCode: item.corp_code || company.corpCode,
    title: item.report_nm,
    filedAt: filedAt(item.rcept_dt),
    sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(item.rcept_no)}`,
  }));
}

export async function fetchDartDisclosures(): Promise<DisclosureItem[]> {
  const apiKey = process.env.DART_API_KEY;
  if (!apiKey) throw new Error("DART_API_KEY가 설정되지 않았습니다.");
  const results = await Promise.all(watchlist.map((company) => fetchCompanyDisclosures(company, apiKey)));
  return results.flat().sort((a, b) => b.filedAt.localeCompare(a.filedAt)).slice(0, 10);
}
