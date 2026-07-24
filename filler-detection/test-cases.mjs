// 검증용 샘플 발화 — 실제 STT가 뱉을 법한 어절 단위 토큰 + 타임스탬프(초)를 손으로 구성
// 각 토큰의 expected: true(필러) / false(정상 성분) / null(판정 대상 아님, 채점에서 제외)

export const cases = [
  {
    id: "determiner-1",
    desc: "'그'가 지시관형사로 쓰인 정상 문장 (필러 아님)",
    tokens: [
      { word: "그", start: 0.0, end: 0.15, expected: false },
      { word: "사람이", start: 0.25, end: 0.55, expected: null },
      { word: "어제", start: 0.6, end: 0.85, expected: null },
      { word: "왔어요", start: 0.9, end: 1.3, expected: null },
    ],
  },
  {
    id: "filler-then-lexicon",
    desc: "'그'가 말끝을 흐리다 '그니까'로 이어지는 필러 패턴",
    tokens: [
      { word: "그", start: 0.0, end: 0.15, expected: true },
      { word: "그니까", start: 0.65, end: 0.95, expected: true },
      { word: "제가", start: 1.0, end: 1.2, expected: null },
      { word: "하고", start: 1.25, end: 1.45, expected: null },
      { word: "싶은", start: 1.5, end: 1.7, expected: null },
      { word: "말은", start: 1.75, end: 2.0, expected: null },
    ],
  },
  {
    id: "interjections-and-repetition",
    desc: "감탄사 필러 + '그' 3연속 반복(더듬음)",
    tokens: [
      { word: "음", start: 0.0, end: 0.2, expected: true },
      { word: "어", start: 0.6, end: 0.75, expected: true },
      { word: "그", start: 1.05, end: 1.15, expected: true },
      { word: "그", start: 1.2, end: 1.3, expected: true },
      { word: "그", start: 1.35, end: 1.45, expected: true },
      { word: "사실은요", start: 1.75, end: 2.1, expected: null },
    ],
  },
  {
    id: "determiner-2",
    desc: "'저'가 지시관형사로 쓰인 정상 문장 (필러 아님)",
    tokens: [
      { word: "저", start: 0.0, end: 0.15, expected: false },
      { word: "자료를", start: 0.2, end: 0.5, expected: null },
      { word: "좀", start: 0.55, end: 0.7, expected: null },
      { word: "보여주세요", start: 0.75, end: 1.2, expected: null },
    ],
  },
  {
    id: "ieje-content",
    desc: "'이제'가 정상적인 시간 부사로 쓰인 문장 (필러 아님)",
    tokens: [
      { word: "이제", start: 0.0, end: 0.25, expected: false },
      { word: "시작하겠습니다", start: 0.3, end: 1.0, expected: null },
    ],
  },
  {
    id: "inje-filler",
    desc: "'인제'가 담화표지 필러로 쓰이고 '그러니까'로 이어짐",
    tokens: [
      { word: "인제", start: 0.0, end: 0.2, expected: true },
      { word: "그러니까", start: 0.8, end: 1.1, expected: true },
      { word: "제", start: 1.15, end: 1.3, expected: null },
      { word: "생각에는", start: 1.35, end: 1.7, expected: null },
    ],
  },
  {
    id: "yakgan-content",
    desc: "'약간'이 정상 부사로 쓰인 문장 (필러 아님)",
    tokens: [
      { word: "약간", start: 0.0, end: 0.2, expected: false },
      { word: "부족했던", start: 0.25, end: 0.6, expected: null },
      { word: "것", start: 0.65, end: 0.75, expected: null },
      { word: "같아요", start: 0.8, end: 1.1, expected: null },
    ],
  },
  {
    id: "yakgan-filler",
    desc: "'약간'이 말을 고르며 쓰는 필러로 쓰이고 '그', '뭐랄까'로 이어짐",
    tokens: [
      { word: "약간", start: 0.0, end: 0.15, expected: true },
      { word: "그", start: 0.65, end: 0.75, expected: true },
      { word: "뭐랄까", start: 0.8, end: 1.05, expected: true },
    ],
  },
  {
    id: "adversarial-unknown-noun-1",
    desc: "[한계 검증] '그' 뒤에 명사가 오지만 NOUN_LIST에 없는 단어(강아지) — 오탐 예상",
    tokens: [
      { word: "그", start: 0.0, end: 0.15, expected: false },
      { word: "강아지가", start: 0.2, end: 0.55, expected: null },
      { word: "짖었어요", start: 0.6, end: 1.0, expected: null },
    ],
  },
  {
    id: "adversarial-unknown-noun-2",
    desc: "[한계 검증] '저' 뒤에 명사가 오지만 NOUN_LIST에 없는 단어(영화) — 오탐 예상",
    tokens: [
      { word: "저", start: 0.0, end: 0.15, expected: false },
      { word: "영화", start: 0.2, end: 0.45, expected: null },
      { word: "진짜", start: 0.5, end: 0.7, expected: null },
      { word: "재밌었어요", start: 0.75, end: 1.2, expected: null },
    ],
  },
  {
    id: "adversarial-unlisted-filler",
    desc: "[한계 검증] 사전에 없는 구어체 필러 '막' — 미탐지(false negative) 예상",
    tokens: [
      { word: "막", start: 0.0, end: 0.15, expected: true },
      { word: "그냥", start: 0.65, end: 0.9, expected: true },
      { word: "뭐랄까", start: 0.95, end: 1.2, expected: true },
    ],
  },
  {
    id: "contractions-clean",
    desc: "지시대명사 축약형('그거','그래서' 등)만 있는 정상 문장 (필러 없음)",
    tokens: [
      { word: "그거", start: 0.0, end: 0.2, expected: false },
      { word: "진짜", start: 0.25, end: 0.45, expected: null },
      { word: "좋은", start: 0.5, end: 0.7, expected: null },
      { word: "생각인", start: 0.75, end: 1.0, expected: null },
      { word: "것", start: 1.05, end: 1.15, expected: null },
      { word: "같아요", start: 1.2, end: 1.5, expected: null },
      { word: "그래서", start: 1.6, end: 1.85, expected: false },
      { word: "저도", start: 1.9, end: 2.1, expected: null },
      { word: "동의해요", start: 2.15, end: 2.5, expected: null },
    ],
  },
];
