# Market Morning

**출근길 시장 브리핑** — 국내 증시 개장 전 주요 시장 지표와 경제 일정, 관심 종목 공시를 빠르게 확인하는 모바일 우선 대시보드입니다.

- GitHub 저장소: `market-morning`
- 목표 배포 주소: [market-morning.vercel.app](https://market-morning.vercel.app)
- 현재 단계: Milestone 4 데이터 어댑터 구현 완료, API 키 등록 진행 중
- 데이터: 주요 지표는 FRED 실데이터이며, 키가 있으면 Twelve Data·한국은행 ECOS·OpenDART 데이터를 함께 사용합니다. 연결되지 않은 항목은 명시적인 대체 모의 데이터입니다.

## 구현된 기능

- 360px 이상 반응형 한글 대시보드
- 헤더, 규칙 기반 아침 요약, 시장 지표, 경제 일정, 공시, 내보내기 섹션
- 재사용 가능한 지표 카드와 최근 5개 세션 SVG 스파크라인
- 펼칠 수 있는 Recharts 1개월 차트
- 라이트·다크 모드와 기기별 설정 저장
- AI 분석용 Markdown 복사·다운로드 및 정규화 JSON 다운로드
- 기본 PWA manifest
- 계산, 누락 데이터, Markdown 내보내기 단위 테스트
- 서버 측 FRED 어댑터, 1시간 재검증, 개별 지표 실패 처리
- Twelve Data 어댑터와 주말 제외 영업일 기준 지연 판정
- 한국은행 ECOS 원/달러 환율 어댑터
- OpenDART 최근 공시 어댑터와 설정 파일 기반 관심 종목

과거 5개·20개 세션 내보내기는 스냅샷 저장 기능이 추가되는 후속 마일스톤까지 비활성화되어 있습니다.

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 엽니다.

## 테스트와 빌드

```bash
npm run test:unit
npm test
npm run lint
npm run build
```

`npm test`는 단위 테스트, Vercel 호환 프로덕션 빌드, 한글 정적 HTML 검증을 차례로 수행합니다.

## Vercel 배포

GitHub의 `market-morning` 저장소를 Vercel에 가져온 뒤 프로젝트 이름을 `market-morning`으로 지정합니다. 프레임워크는 Next.js로 자동 감지되며 별도 빌드 설정은 필요하지 않습니다. 이름을 사용할 수 있다면 기본 주소는 `https://market-morning.vercel.app`이 됩니다.

### Twelve Data 실데이터 설정

[Twelve Data](https://twelvedata.com/)에서 무료 API 키를 발급받아 Vercel 프로젝트의 `TWELVE_DATA_API_KEY` 환경변수로 등록합니다. 키는 코드나 GitHub에 저장하지 않습니다. 기본 심볼은 `.env.example`에 있으며 제공자 검색 결과가 다르면 환경변수로 교체할 수 있습니다.

### ECOS·OpenDART 설정

- 한국은행 ECOS에서 발급받은 키를 Vercel의 `ECOS_API_KEY`에 등록합니다.
- OpenDART에서 발급받은 키를 Vercel의 `DART_API_KEY`에 등록합니다.
- 기본 관심 종목은 `src/config/watchlist.ts`에서 회사명, 종목코드, DART 고유번호를 변경할 수 있습니다.
- ECOS 통계표·항목 코드 기본값은 `.env.example`에 있으며, 통계 개편 시 환경변수로 교체할 수 있습니다.

## 데이터 교체 위치

`src/lib/providers/` 아래의 FRED, Twelve Data, ECOS, OpenDART 어댑터가 외부 응답을 내부 `MorningMarketSnapshot` 형식으로 정규화합니다. `src/lib/snapshot/get-snapshot.ts`에서 병렬 수집과 부분 실패 처리를 수행하며, 지원하지 않거나 실패한 항목은 `src/data/mock-snapshot.ts`의 값을 대체 데이터로 사용합니다.

## 아직 포함하지 않은 범위

- 예약 수집과 과거 스냅샷 저장
- 인증과 데이터베이스
- AI API 연결
- 실제 투자 추천
- ECOS·OpenDART API 키 등록과 프로덕션 응답 검증
