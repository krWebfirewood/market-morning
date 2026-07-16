import type { MarketIndicator, TimeSeriesPoint } from "../../types/market";
import { applyFredSeries } from "./fred";

interface EcosRow {
  TIME?: string;
  DATA_VALUE?: string;
}

interface EcosResponse {
  StatisticSearch?: { row?: EcosRow[] };
  RESULT?: { MESSAGE?: string };
}

function compactDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export async function fetchEcosUsdKrw(): Promise<TimeSeriesPoint[]> {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) throw new Error("ECOS_API_KEY가 설정되지 않았습니다.");

  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 45);
  const statCode = process.env.ECOS_USDKRW_STAT_CODE ?? "731Y001";
  const itemCode = process.env.ECOS_USDKRW_ITEM_CODE ?? "0000001";
  const path = [
    "StatisticSearch", apiKey, "json", "kr", "1", "100", statCode, "D",
    compactDate(start), compactDate(end), itemCode,
  ].map(encodeURIComponent).join("/");
  const response = await fetch(`https://ecos.bok.or.kr/api/${path}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`ECOS 응답 오류: ${response.status}`);

  const payload = (await response.json()) as EcosResponse;
  const points = (payload.StatisticSearch?.row ?? [])
    .map((row) => ({
      date: `${row.TIME?.slice(0, 4)}-${row.TIME?.slice(4, 6)}-${row.TIME?.slice(6, 8)}`,
      value: Number(row.DATA_VALUE),
    }))
    .filter((point) => /^\d{4}-\d{2}-\d{2}$/.test(point.date) && Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) {
    throw new Error(payload.RESULT?.MESSAGE ?? "ECOS 원/달러 유효 관측값이 부족합니다.");
  }
  return points.slice(-20);
}

export function applyEcosSeries(base: MarketIndicator, points: TimeSeriesPoint[]) {
  return {
    ...applyFredSeries(base, "ECOS", points),
    source: "한국은행 ECOS · 원/달러",
    sourceUrl: "https://ecos.bok.or.kr/",
  };
}
