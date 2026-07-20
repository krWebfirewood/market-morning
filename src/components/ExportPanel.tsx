"use client";

import { useState } from "react";
import type { MorningMarketSnapshot } from "../types/market";
import { snapshotToMarkdown } from "../lib/export/markdown";

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel({ snapshot }: { snapshot: MorningMarketSnapshot }) {
  const [message, setMessage] = useState("");
  const markdown = snapshotToMarkdown(snapshot);
  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setMessage("Markdown을 복사했습니다");
    window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <div className="export-panel">
      <div><p className="eyebrow">분석 준비 완료</p><h3>브리핑을 이어서 활용하세요</h3><p>ChatGPT용 구조화 Markdown을 복사하거나 실제 수집값과 미수집 상태가 구분된 스냅샷을 저장할 수 있습니다.</p></div>
      <div className="export-actions">
        <button className="primary-action" onClick={copy}>AI 분석용 Markdown 복사</button>
        <button onClick={() => download(`market-morning-${snapshot.marketDate}.md`, markdown, "text/markdown")}>Markdown 다운로드</button>
        <button onClick={() => download(`market-morning-${snapshot.marketDate}.json`, JSON.stringify(snapshot, null, 2), "application/json")}>JSON 다운로드</button>
      </div>
      <div className="history-actions"><button disabled title="과거 스냅샷은 후속 마일스톤에서 구현됩니다">최근 5개 세션</button><button disabled title="과거 스냅샷은 후속 마일스톤에서 구현됩니다">최근 20개 세션</button><span>스냅샷 저장 기능이 추가되면 사용할 수 있습니다.</span></div>
      <p className="toast" aria-live="polite">{message}</p>
    </div>
  );
}
