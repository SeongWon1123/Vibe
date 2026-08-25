const PLACEHOLDER_KEYS = new Set(['', '발급받은키', 'your_api_key_here'])

const OPENROUTER_MODELS = {
  'grok-4-fast': 'x-ai/grok-4-fast',
  'grok-4': 'x-ai/grok-4',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4.1-mini': 'openai/gpt-4.1-mini',
}

function isOpenRouterKey(key) {
  return /^sk-or-/.test(key)
}

export function resolveLlm(env = process.env) {
  const apiKey = String(env.LLM_API_KEY || '').trim()
  let baseUrl = String(env.LLM_BASE_URL || '').trim().replace(/\/$/, '')
  let model = String(env.LLM_MODEL || '').trim()
  const missing = PLACEHOLDER_KEYS.has(apiKey)

  if (!missing && isOpenRouterKey(apiKey)) {
    const looksWrong =
      !baseUrl ||
      /x\.ai|api\.openai\.com|api\.anthropic\.com/i.test(baseUrl) ||
      baseUrl === 'https://openrouter.ai'
    if (looksWrong || (baseUrl.includes('openrouter.ai') && !baseUrl.includes('/api/'))) {
      baseUrl = 'https://openrouter.ai/api/v1'
    }
    if (!model) model = 'openai/gpt-4o-mini'
    else if (!model.includes('/')) model = OPENROUTER_MODELS[model] || model
  }

  return { apiKey, baseUrl, model, missing }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, systemPrompt } = req.body ?? {}
  const history = Array.isArray(messages) ? messages.slice(-20) : []
  const { apiKey, baseUrl, model, missing } = resolveLlm()

  if (missing || !baseUrl || !model) {
    res.json({ ok: true })
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
  if (baseUrl.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = 'https://donghak.app'
    headers['X-Title'] = 'DongHak'
  }

  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        temperature: 0.4,
        max_tokens: 900,
      }),
    })
    const data = await r.json().catch(() => ({}))
    const reply = data.choices?.[0]?.message?.content
    if (!r.ok || !reply) {
      const raw = data.error?.message || data.error || data.reply || `HTTP ${r.status}`
      res.json({ error: String(raw).slice(0, 240) })
      return
    }
    res.json({ reply })
  } catch {
    res.json({ error: '네트워크 오류. OpenRouter 주소와 키를 다시 확인하세요.' })
  }
}
