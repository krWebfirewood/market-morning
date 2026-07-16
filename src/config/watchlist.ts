export interface WatchlistCompany {
  name: string;
  ticker: string;
  corpCode: string;
}

export const watchlist: WatchlistCompany[] = [
  { name: "삼성전자", ticker: "005930", corpCode: "00126380" },
  { name: "SK하이닉스", ticker: "000660", corpCode: "00164779" },
];
