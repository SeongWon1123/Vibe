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

// 전시 기간 비용 가드: 인스턴스 메모리 기준 IP당 분당 10회
const WINDOW_MS = 60_000
const LIMIT = 10
const hits = new Map()

function tooMany(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > LIMIT
}

function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for']
  return String(Array.isArray(fwd) ? fwd[0] : fwd || req.headers?.['x-real-ip'] || 'local')
    .split(',')[0]
    .trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (tooMany(clientIp(req))) {
    res.json({ error: '잠시 후 다시 물어봐 주세요. 1분에 10번까지 답할 수 있어요.' })
    return
  }

  const { messages, systemPrompt: rawPrompt } = req.body ?? {}
  const systemPrompt = String(rawPrompt || '').slice(0, 24_000)
  const history = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20)
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

  const payload = JSON.stringify({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...history],
    temperature: 0.4,
    max_tokens: 900,
  })

  // 느린 소켓 한 번은 참고 넘어간다: 20초 타임아웃 × 최대 2회
  let lastError = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const r = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: payload,
        signal: AbortSignal.timeout(20_000),
      })
      const data = await r.json().catch(() => ({}))
      const reply = String(data.choices?.[0]?.message?.content || '').trim()
      if (r.ok && reply) {
        res.json({ reply })
        return
      }
      lastError = String(data.error?.message || data.error || `HTTP ${r.status}`).slice(0, 240)
      if (r.status === 401 || r.status === 402 || r.status === 404) break
    } catch (err) {
      const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError'
      lastError = timedOut
        ? '모델 응답이 너무 늦어요. 잠시 후 다시 물어봐 주세요.'
        : '네트워크 오류. OpenRouter 주소와 키를 다시 확인하세요.'
    }
  }
  res.json({ error: lastError || '응답을 받지 못했어요.' })
}
