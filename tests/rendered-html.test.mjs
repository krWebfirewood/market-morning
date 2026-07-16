import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Market Morning 정적 HTML이 한글로 생성된다", async () => {
  const html = await readFile(
    new URL("../.next/server/app/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<html lang="ko"/i);
  assert.match(html, /<title>Market Morning \| 출근길 시장 브리핑<\/title>/i);
  assert.match(html, /출근길/);
  assert.match(html, /FRED 실데이터/);
  assert.match(html, /아침 요약/);
  assert.match(html, /투자 조언/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
