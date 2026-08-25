export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, systemPrompt } = req.body ?? {}
  const history = Array.isArray(messages) ? messages.slice(-20) : []
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  const model = process.env.LLM_MODEL

  if (!apiKey || apiKey === '발급받은키' || !baseUrl || !model) {
    res.json({ ok: true })
    return
  }

  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        temperature: 0.4,
        max_tokens: 900,
      }),
    })
    const data = await r.json()
    res.json({ reply: data.choices?.[0]?.message?.content ?? '(응답 오류)' })
  } catch {
    res.json({ reply: '잠시 후 다시 시도해주세요' })
  }
}
