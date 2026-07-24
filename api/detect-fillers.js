import { buildGeminiRequest } from "../lib/filler-prompt.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 지원합니다." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." });
    return;
  }

  const { tokens } = req.body ?? {};
  if (!Array.isArray(tokens) || tokens.length === 0) {
    res.status(400).json({ error: "tokens 배열이 필요합니다." });
    return;
  }

  const { model, body } = buildGeminiRequest(tokens);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      res.status(502).json({ error: `Gemini API 오류 (${geminiRes.status})`, detail: errText });
      return;
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "Gemini 응답 파싱 실패", detail: data });
      return;
    }

    const parsed = JSON.parse(text);
    const fillerIndices = new Map(parsed.fillers.map((f) => [f.index, f]));

    const result = tokens.map((tok, i) => {
      const hit = fillerIndices.get(i);
      return {
        ...tok,
        isFiller: !!hit,
        reason: hit ? `gemini:${hit.type}` : "gemini:not-filler",
      };
    });

    res.status(200).json({ tokens: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
