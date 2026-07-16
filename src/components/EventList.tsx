import type { EconomicEvent } from "../types/market";

export function EventList({ events }: { events: EconomicEvent[] }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <article className="event-row" key={event.id}>
          <time dateTime={event.dateTimeKst}>{event.dateTimeKst.slice(11, 16)}<span>KST</span></time>
          <div className="event-content">
            <div className="event-title"><span className="country">{event.country}</span><h3>{event.title}</h3></div>
            <div className="event-meta"><span className={`importance importance-${event.importance}`} aria-label={`중요도 3단계 중 ${event.importance}단계`}>{"●".repeat(event.importance)}{"○".repeat(3 - event.importance)}</span><span>이전 {event.previous ?? "—"}</span><span>예상 {event.consensus ?? "—"}</span><span>실제 {event.actual ?? "발표 대기"}</span></div>
          </div>
          {event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="source-link">공식 출처 ↗</a>}
        </article>
      ))}
    </div>
  );
}
