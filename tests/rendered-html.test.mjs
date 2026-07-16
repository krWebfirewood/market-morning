import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Market Morning prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Market Morning \| 출근길 시장 브리핑<\/title>/i);
  assert.match(html, /출근길/);
  assert.match(html, /정적 프로토타입/);
  assert.match(html, /아침 요약/);
  assert.match(html, /투자 조언/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});
