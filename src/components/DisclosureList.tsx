import type { DisclosureItem } from "../types/market";

export function DisclosureList({ disclosures }: { disclosures: DisclosureItem[] }) {
  if (!disclosures.length) return <div className="empty-state">관심 종목의 새 공시가 없습니다.</div>;
  return (
    <div className="disclosure-grid">
      {disclosures.map((item) => (
        <article className="disclosure-card" key={item.id}>
          <div className="disclosure-top"><span className="new-badge">신규</span><time dateTime={item.filedAt}>{item.filedAt.slice(5, 16).replace("T", " · ")} KST</time></div>
          <h3>{item.companyName}</h3>
          <p className="ticker">{item.ticker} · 고유번호 {item.corpCode}</p>
          <p className="filing-title">{item.title}</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">DART에서 보기 ↗</a>
        </article>
      ))}
    </div>
  );
}
