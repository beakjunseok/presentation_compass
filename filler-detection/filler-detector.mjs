// 한국어 필러워드 탐지 로직 (v1 프로토타입)
// 입력: STT 결과 토큰 배열 [{ word, start, end }, ...] (초 단위 타임스탬프, 어절 단위 토큰)
// 출력: 각 토큰에 isFiller / reason을 붙인 배열

// 문맥 없이 항상 필러로 판단해도 안전한 감탄사/담화표지
const UNAMBIGUOUS_FILLERS = new Set([
  "음", "어", "엄", "아", "어어", "음음",
  "그니까", "그러니까", "뭐랄까", "뭐지", "말하자면",
]);

// "그것/저것"이 조사와 축약 결합된 형태 — 지시대명사로서 정상적인 문장 성분이므로 필러 아님
const DEMONSTRATIVE_CONTRACTIONS = new Set([
  "그거", "그게", "그건", "그걸", "그런", "그래서", "그러면", "그러다가",
  "저거", "저게", "저건", "저걸",
]);

// 문맥에 따라 필러/정상 성분이 갈리는 단어 ("그", "저" 제외 — 별도 규칙 적용)
const AMBIGUOUS = new Set(["약간", "이제", "인제"]);

// "그"/"저" 뒤에 이 목록의 명사(어두 일치)가 바로 오면 지시관형사(정상 문장 성분)로 판단
const NOUN_LIST = [
  "사람", "거", "것", "분", "때", "부분", "경우", "문제", "자료", "내용",
  "프로젝트", "이유", "방법", "결과", "사실", "친구", "회사", "팀", "자리",
  "순간", "시점", "아이", "학생", "선생님", "분야", "상황", "질문", "발표",
  "쪽", "정도", "느낌", "지점", "장면", "얘기", "이야기",
];

function startsWithNoun(word) {
  if (!word) return false;
  return NOUN_LIST.some((n) => word.startsWith(n));
}

export function classifyToken(tokens, i, { pauseThreshold = 0.35 } = {}) {
  const tok = tokens[i];
  const w = tok.word;
  const nextWord = i < tokens.length - 1 ? tokens[i + 1].word : null;
  const prevWord = i > 0 ? tokens[i - 1].word : null;
  const nextGap = i < tokens.length - 1 ? tokens[i + 1].start - tok.end : 0;

  if (DEMONSTRATIVE_CONTRACTIONS.has(w)) {
    return { isFiller: false, reason: "demonstrative-contraction" };
  }

  if (UNAMBIGUOUS_FILLERS.has(w)) {
    return { isFiller: true, reason: "unambiguous-filler-lexicon" };
  }

  // 반복(더듬음): 같은 어절이 바로 이어지면 필러로 간주
  if (nextWord === w || prevWord === w) {
    return { isFiller: true, reason: "repetition" };
  }

  if (w === "그" || w === "저") {
    if (startsWithNoun(nextWord)) {
      return { isFiller: false, reason: "determiner-before-noun" };
    }
    return {
      isFiller: true,
      reason: nextGap > pauseThreshold ? "bare-demonstrative+pause" : "bare-demonstrative-no-noun-follow",
    };
  }

  if (AMBIGUOUS.has(w)) {
    const nextIsFillerish = nextWord && (UNAMBIGUOUS_FILLERS.has(nextWord) || AMBIGUOUS.has(nextWord));
    if (nextGap > pauseThreshold || nextIsFillerish) {
      return { isFiller: true, reason: "pause-or-filler-chain" };
    }
    return { isFiller: false, reason: "adverbial-content-default" };
  }

  return { isFiller: false, reason: "not-filler-lexicon" };
}

export function detectFillers(tokens, opts) {
  return tokens.map((tok, i) => ({ ...tok, ...classifyToken(tokens, i, opts) }));
}
