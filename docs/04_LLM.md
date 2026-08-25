# 04. LLM 연동 (진짜 심장 1)

> 목표: 페르소나 + 지식베이스가 주입된 실제 LLM 대화
> 예상 소요: 반나절

---

## A. 서버 — `api/chat.js`

작업 지시 (Cursor):

```js
// OpenAI 호환 chat completions 프록시
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, systemPrompt } = req.body;

  const r = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 900,
    }),
  });
  const data = await r.json();
  res.json({ reply: data.choices?.[0]?.message?.content ?? '(응답 오류)' });
}
```

- 에러 시 사용자에게는 "잠시 후 다시 시도해주세요"가 보이도록 프론트에서 처리
- 스트리밍은 하지 않는다 (닷새 원칙 — 로딩 스피너로 충분)

## B. 시스템 프롬프트 — 프론트에서 조립

`ChatWindow.jsx`에서 전송 시 다음을 조립해 `systemPrompt`로 전달:

```
당신은 '동학(同學)'입니다. 국립순천대학교 학생의 4년을 함께하는 AI 선배로,
학생 프로필과 학사 지식을 근거로 구체적이고 실행 가능한 조언을 합니다.

[학생 프로필]
{선택된 페르소나 profile JSON}

[학사 지식베이스]
{KNOWLEDGE 전문}

[응답 규칙]
1. 반드시 프로필의 학년·이수과목·목표를 근거로 답한다. 근거가 된 프로필 항목을 자연스럽게 언급한다.
   (예: "성원님은 아직 네트워크를 안 들으셨으니...")
2. 졸업요건 질문에는 gradAudit의 missing 항목을 체크리스트로 보여준다.
3. 교양 추천은 관심분야 + 졸업요건에서 비어있는 영역을 교차해서 추천한다.
4. 사용자가 공지사항 텍스트를 붙여넣고 저장/캘린더를 언급하면, 응답 마지막 줄에
   정확히 다음 형식의 JSON 한 줄을 추가한다:
   [ICS]{"title":"행사명","date":"YYYY-MM-DD","time":"HH:MM","location":"장소"}[/ICS]
5. 답변은 한국어, 300자 내외, 마크다운 목록 활용. 모르는 것은 지어내지 말고
   "학과 사무실 확인이 필요해요"라고 답한다.
```

- `[ICS]...[/ICS]` 규약이 05 단계의 캘린더 기능과 연결되는 핵심. 지금 넣어둔다.

## C. 품질 튜닝 체크 (데모 질문 3종 리허설)

각 페르소나에서 "이번 학기에 뭘 해야 할까?"를 물었을 때:

| 페르소나 | 기대 답변 요소 |
|---|---|
| 1학년 | 기초 과목(교육과정표 근거) + 탐색 활동 제안. 자격증 얘기 없어야 자연스러움 |
| 3학년 | 목표(네이버클라우드) 언급 + 클라우드 관련 과목/자격증 + missing 요건 언급 |
| 4학년 | **공인영어성적 미충족을 먼저 지적** + 졸업작품 일정 |

기대 요소가 안 나오면 응답 규칙 1~3을 더 구체적으로 수정하며 반복.

## 완료 기준

- [ ] 세 페르소나 모두 실제 LLM 응답이 온다 (더미 아님)
- [ ] 위 표의 기대 답변 요소가 3/3 충족
- [ ] API 키가 브라우저 네트워크 탭에 노출되지 않는다 (요청이 `/api/chat`으로만 나감)
- [ ] 에러 시 앱이 죽지 않고 안내 메시지 표시

## 검증 보고 (Claude에게)

- 페르소나 3개 × "이번 학기에 뭘 해야 할까?" 실제 응답 전문 붙여넣기 → 답변 차별화 검증받기
