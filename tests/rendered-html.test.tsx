import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Dashboard } from "../src/components/Dashboard";
import { mockSnapshot } from "../src/data/mock-snapshot";

test("Market Morning 화면이 한글 HTML로 렌더링된다", () => {
  const html = renderToStaticMarkup(<Dashboard snapshot={mockSnapshot} />);

  assert.match(html, /Market Morning/);
  assert.match(html, /출근길/);
  assert.match(html, /실데이터/);
  assert.match(html, /아침 요약/);
  assert.match(html, /투자 조언/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
