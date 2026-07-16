import assert from "node:assert/strict";
import test from "node:test";
import { calculateBasisPoints, calculateChange, calculatePercentageChange } from "../src/lib/calculations/market";
import { snapshotToMarkdown } from "../src/lib/export/markdown";
import { mockSnapshot } from "../src/data/mock-snapshot";

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
  assert.match(snapshotToMarkdown(snapshot), /S&P 500: 데이터 없음/);
});
