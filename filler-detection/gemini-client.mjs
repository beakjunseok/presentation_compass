// 브라우저에서 호출하는 클라이언트 — Gemini API 키를 직접 다루지 않고,
// 서버(Vercel 서버리스 함수 /api/detect-fillers)에 위임한다.

export async function classifyWithGemini(tokens) {
  const res = await fetch("/api/detect-fillers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `요청 실패 (${res.status})`);
  }

  const data = await res.json();
  return data.tokens;
}
