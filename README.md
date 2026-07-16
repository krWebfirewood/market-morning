# Market Morning

**출근길 시장 브리핑** — 국내 증시 개장 전 주요 시장 지표와 경제 일정, 관심 종목 공시를 빠르게 확인하는 모바일 우선 대시보드입니다.

- GitHub 저장소: `market-morning`
- 목표 배포 주소: [market-morning.vercel.app](https://market-morning.vercel.app)
- 현재 단계: Milestone 1 정적 UI 프로토타입
- 데이터: 단일 정규화 모의 스냅샷, 외부 API 미연결

## 구현된 기능

- 360px 이상 반응형 한글 대시보드
- 헤더, 규칙 기반 아침 요약, 시장 지표, 경제 일정, 공시, 내보내기 섹션
- 재사용 가능한 지표 카드와 최근 5개 세션 SVG 스파크라인
- 펼칠 수 있는 Recharts 1개월 차트
- 라이트·다크 모드와 기기별 설정 저장
- AI 분석용 Markdown 복사·다운로드 및 정규화 JSON 다운로드
- 기본 PWA manifest
- 계산, 누락 데이터, Markdown 내보내기 단위 테스트

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

## 데이터 교체 위치

화면 전체 데이터는 `src/data/mock-snapshot.ts`의 단일 `MorningMarketSnapshot`에서 가져옵니다. 후속 마일스톤에서는 이 객체를 검증된 실제 스냅샷으로 교체하면 되며 UI 컴포넌트는 특정 제공자 응답 구조에 의존하지 않습니다.

## 아직 포함하지 않은 범위

- 외부 데이터 제공자 및 API 어댑터
- 예약 수집과 과거 스냅샷 저장
- 인증과 데이터베이스
- AI API 연결
- 실제 투자 추천
- Vercel 프로덕션 배포
