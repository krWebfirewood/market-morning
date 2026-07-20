import assert from "node:assert/strict";
import test from "node:test";
import { calculateBasisPoints, calculateChange, calculatePercentageChange } from "../src/lib/calculations/market";
import { snapshotToMarkdown } from "../src/lib/export/markdown";
import { mockSnapshot } from "../src/data/mock-snapshot";
import { isMorningMarketSnapshot } from "../src/lib/validation/snapshot";
import { applyFredSeries, parseFredBatchCsv } from "../src/lib/providers/fred";
import { businessDaysSince, isMarketDataStale } from "../src/lib/freshness/business-days";
import { applyTwelveDataSeries } from "../src/lib/providers/twelve-data";
import { applyEcosSeries } from "../src/lib/providers/ecos";

test("calculates absolute market changes", () => {
  assert.equal(calculateChange(1385.2, 1375.8), 9.4);
  assert.equal(calculateChange(null, 100), null);
});

test("calculates percentage changes and handles zero or missing values", () => {
  assert.equal(calculatePercentageChange(6250.12, 6223.98), 0.42);
  assert.equal(calculatePercentageChange(10, 0), null);
  assert.equal(calculatePercentageChange(null, 10), null);
});

test("converts percentage-point yield changes to basis points", () => {
  assert.equal(calculateBasisPoints(4.36, 4.28), 8);
  assert.equal(calculateBasisPoints(4.12, null), null);
});

test("exports a readable Markdown briefing from the normalized snapshot", () => {
  const markdown = snapshotToMarkdown(mockSnapshot);
  assert.match(markdown, /^# Market Morning 데이터/m);
  assert.match(markdown, /## 밤사이 주요 시장/);
  assert.match(markdown, /S&P 500: 6,250\.12, 일간 변동 \+0\.42%/);
  assert.match(markdown, /## 오늘의 주요 일정/);
  assert.match(markdown, /삼성전자/);
  assert.match(markdown, /모의 데이터/);
});

test("Markdown export tolerates missing indicator values", () => {
  const snapshot = structuredClone(mockSnapshot);
  snapshot.indicators[0].value = null;
  snapshot.indicators[0].change = null;
  snapshot.indicators[0].changePercent = null;
  assert.match(snapshotToMarkdown(snapshot), /S&P 500: 미수집/);
});

test("정규화된 스냅샷 구조를 검증한다", () => {
  assert.equal(isMorningMarketSnapshot(mockSnapshot), true);
  assert.equal(isMorningMarketSnapshot({ ...mockSnapshot, indicators: null }), false);
});

test("FRED 관측값을 정규화된 지표로 변환한다", () => {
  const base = mockSnapshot.indicators.find((item) => item.id === "sp500")!;
  const normalized = applyFredSeries(base, "SP500", [
    { date: "2026-07-14", value: 100 },
    { date: "2026-07-15", value: 101 },
  ]);
  assert.equal(normalized.value, 101);
  assert.equal(normalized.change, 1);
  assert.equal(normalized.changePercent, 1);
  assert.match(normalized.source, /FRED/);
});

test("여러 FRED 계열의 CSV를 한 번에 분리한다", () => {
  const parsed = parseFredBatchCsv([
    "observation_date,SP500,DGS10",
    "2026-07-14,6200,4.20",
    "2026-07-15,6250,4.25",
  ].join("\n"));
  assert.deepEqual(parsed.SP500.at(-1), { date: "2026-07-15", value: 6250 });
  assert.deepEqual(parsed.DGS10.at(-1), { date: "2026-07-15", value: 4.25 });
});

test("FRED CSV의 빈 관측값을 0으로 오인하지 않는다", () => {
  const parsed = parseFredBatchCsv([
    "observation_date,SP500,DGS10",
    "2026-07-14,,4.20",
    "2026-07-15,6250,",
  ].join("\n"));
  assert.deepEqual(parsed.SP500, [{ date: "2026-07-15", value: 6250 }]);
  assert.deepEqual(parsed.DGS10, [{ date: "2026-07-14", value: 4.2 }]);
});

test("큰 등락도 과장된 강도 표현 없이 상승·하락으로 분류한다", () => {
  const base = mockSnapshot.indicators.find((item) => item.id === "sp500")!;
  const rise = applyFredSeries(base, "SP500", [
    { date: "2026-07-14", value: 100 },
    { date: "2026-07-15", value: 103 },
  ], new Date("2026-07-16T12:00:00Z"));
  const fall = applyFredSeries(base, "SP500", [
    { date: "2026-07-14", value: 100 },
    { date: "2026-07-15", value: 97 },
  ], new Date("2026-07-16T12:00:00Z"));
  assert.equal(rise.status, "rise");
  assert.equal(fall.status, "fall");
});

test("주말을 제외한 영업일 수로 지연 여부를 판정한다", () => {
  assert.equal(businessDaysSince("2026-07-10", new Date("2026-07-13T12:00:00Z")), 1);
  assert.equal(isMarketDataStale("2026-07-10", "equity", new Date("2026-07-13T12:00:00Z")), false);
  assert.equal(isMarketDataStale("2026-07-08", "equity", new Date("2026-07-13T12:00:00Z")), true);
});

test("Twelve Data 관측값을 제공자 독립 지표로 변환한다", () => {
  const base = mockSnapshot.indicators.find((item) => item.id === "gold")!;
  const normalized = applyTwelveDataSeries(base, "XAU/USD", [
    { date: "2026-07-14", value: 2400 },
    { date: "2026-07-15", value: 2424 },
  ]);
  assert.equal(normalized.changePercent, 1);
  assert.match(normalized.source, /Twelve Data/);
});

test("ECOS 원달러 관측값을 제공자 독립 지표로 변환한다", () => {
  const base = mockSnapshot.indicators.find((item) => item.id === "usdkrw")!;
  const normalized = applyEcosSeries(base, [
    { date: "2026-07-14", value: 1380 },
    { date: "2026-07-15", value: 1385.5 },
  ]);
  assert.equal(normalized.value, 1385.5);
  assert.equal(normalized.change, 5.5);
  assert.match(normalized.source, /한국은행 ECOS/);
});
