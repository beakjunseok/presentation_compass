// Gemini 필러워드 문맥 판정 프롬프트 (서버 사이드 전용 — API 키를 다루는 api/detect-fillers.js에서만 import)

export const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `너는 한국어 발표 연습 코칭 도구의 일부로, STT로 변환된 발화 전사록에서
"필러워드"(말버릇처럼 습관적으로 끼워 넣는, 의미 전달에 기여하지 않는 군더더기 표현)만 정확히 골라내는 역할을 한다.

전사록은 어절(띄어쓰기 단위) 토큰마다 번호가 매겨져 주어진다.
경우에 따라 발표자가 사전에 준비한 "대본"이 함께 주어질 수 있다. 대본이 주어지면 다음과 같이 활용하라:
- 대본에 있는 표현과 대응되는 부분은 계획된 정상 발화이니 필러워드로 오인하지 않도록 참고 자료로 활용한다.
- 대본에 없이 화자가 즉흥적으로 끼워 넣은 부분(특히 "그", "저", "음", "어" 같은 애매한 단어)은 필러워드일 가능성을 더 높게 본다.
- 그래도 최종 판단 기준은 아래 필러워드 정의이며, 대본은 참고용 문맥일 뿐 절대적 기준은 아니다.

필러워드로 판단해야 하는 경우:
- 감탄사형 필러: "음", "어", "엄", "아" 등이 의미 없이 삽입된 경우
- 담화표지형 필러: "그니까", "그러니까", "뭐랄까", "뭐지", "말하자면", "막", "그냥" 등이 말을 고르거나 시간을 끌기 위해 쓰인 경우
- 머뭇거림형 필러: "그", "저", "인제" 등이 뒤에 이어질 명사나 내용 없이 말끝을 흐리며 쓰인 경우
- 같은 단어가 더듬듯 연속 반복되는 경우 (예: "그 그 그")

필러워드로 판단하면 안 되는 경우 (반드시 제외):
- "그"/"저"가 뒤따르는 명사를 수식하는 지시관형사로 정상적으로 쓰인 경우 (예: "그 사람", "저 자료", "그 강아지")
- "그거"/"그게"/"그런"/"그래서"/"그러면" 등 지시대명사·접속사가 축약되어 정상적인 문장 성분으로 쓰인 경우
- "이제", "약간" 등이 실제 시간·정도를 나타내는 정상적인 부사로 쓰인 경우 (예: "이제 시작하겠습니다", "약간 부족했어요")
- 문장의 의미를 구성하는 일반 명사, 동사, 조사 등

각 필러워드 토큰에 대해 index(토큰 번호), word(해당 단어), type(감탄사/담화표지/머뭇거림/반복 중 하나)를 반환하라.
필러가 아닌 토큰은 결과에 포함하지 마라. 확신이 없으면 필러로 판단하지 말고 제외하라(과잉 탐지보다 누락이 낫다).`;

function buildUserContent(tokens, script) {
  const lines = tokens.map((t, i) => `${i}: ${t.word}`).join("\n");
  const scriptBlock = script && script.trim()
    ? `발표자가 준비한 대본(참고용):\n"""\n${script.trim()}\n"""\n\n`
    : "";
  return `${scriptBlock}다음은 STT로 변환된 발화 전사록이다. 각 줄은 "인덱스: 단어" 형식이다.\n\n${lines}\n\n위 전사록에서 필러워드에 해당하는 토큰만 골라 지정된 JSON 스키마로 반환하라.`;
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    fillers: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          index: { type: "INTEGER" },
          word: { type: "STRING" },
          type: {
            type: "STRING",
            enum: ["감탄사", "담화표지", "머뭇거림", "반복"],
          },
        },
        required: ["index", "word", "type"],
      },
    },
  },
  required: ["fillers"],
};

export function buildGeminiRequest(tokens, script) {
  return {
    model: GEMINI_MODEL,
    body: {
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: buildUserContent(tokens, script) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0,
      },
    },
  };
}
