# presentation-compass

한국어 특화 발표 연습 피드백 도구. 녹음/업로드한 발표를 STT로 변환하고, 필러워드·말 속도·침묵 패턴을 분석해 데이터로 보여준다.

## 현재 진행 단계

필러워드(음/어/그/그니까 등) 탐지 로직 프로토타입 검증 단계. `filler-detection/index.html`이 검증용 테스트 하네스다.

- 1단계: 규칙 기반(정규식+사전) 탐지 — `filler-detection/filler-detector.mjs`
  - "그"/"저" 뒤에 명사가 오면 지시관형사(정상), 아니면 필러로 판단하는 등 휴리스틱 사용
  - 한계: 하드코딩된 명사 목록에 없는 단어는 오탐/미탐 발생 (손 테스트셋 100% → 함정 케이스 포함 시 82.6%)
- 2단계: Gemini 문맥 판정 — 규칙 기반이 놓치는 애매한 경우를 LLM에 위임
  - 프롬프트/스키마: `lib/filler-prompt.mjs`
  - 서버리스 프록시: `api/detect-fillers.js` (API 키를 서버에서만 보관, 브라우저에는 노출 안 됨)
  - 클라이언트 호출부: `filler-detection/gemini-client.mjs`

## 배포 (Vercel)

1. 이 저장소를 Vercel 프로젝트로 import
2. Vercel 프로젝트 설정 → Environment Variables에 `GEMINI_API_KEY` 추가 (Google AI Studio에서 발급)
3. 배포 후 `<배포주소>/filler-detection/index.html`에서 규칙 기반 vs Gemini 정확도 비교 테스트 가능

`/api/detect-fillers`는 Vercel 서버리스 함수이므로 정적 파일만 여는 로컬 환경(`python -m http.server` 등)에서는 2단계(Gemini) 버튼이 동작하지 않는다. Vercel CLI로 `vercel dev`를 쓰거나, 배포 후 테스트할 것.

## 다음 단계 (미착수)

- 실제 녹음(MediaRecorder API) + STT 파이프라인 연결
- 말 속도(WPM) 구간별 분석, 침묵 구간(2초+) 탐지
- 결과 리포트 UI (타임라인 마킹 + 요약 통계)
