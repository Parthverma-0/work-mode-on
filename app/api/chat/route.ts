import { NextRequest, NextResponse } from 'next/server'

// Support chatbot proxy → Google Gemini. The API key stays on the server.
// Configure in .env.local:  GEMINI_API_KEY=...   (optional: GEMINI_MODEL=...)

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `You are "WMO Assistant", the friendly in-app support bot for Work Mode On (WMO) — a modern job & hiring platform.

About WMO:
- Two kinds of users: candidates (job seekers) and companies (recruiters).
- It's "Tinder for jobs": candidates swipe on roles (right = apply, left = pass, star = save). Companies swipe on their applicants (right = shortlist, left = pass).
- When a company shortlists a candidate who applied, it's a mutual "match" and they can message each other.
- Candidates: build a profile (headline, skills, education, résumé), browse/Discover jobs, apply, track applications, and chat with recruiters.
- Companies: post jobs, review applicants via swipe, shortlist, and message candidates.

Your job:
- Help users understand and use the product. Be warm, concise, and practical (2-4 short sentences, use bullets when listing steps).
- For account- or data-specific questions you can't see (e.g. "where is my application?"), guide them to the right page (Dashboard, Discover, Browse jobs, My applications, Messages, Profile).
- If you don't know something or it's outside WMO, say so briefly and suggest contacting support. Never invent policies, pricing, or features.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'The assistant isn’t configured yet. (Add GEMINI_API_KEY to .env.local.)' },
      { status: 503 },
    )
  }

  let body: { messages?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const messages = (body.messages ?? [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-12) // keep the last few turns for context

  if (!messages.length) {
    return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content.slice(0, 4000) }],
  }))

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('Gemini error', res.status, detail)
      return NextResponse.json({ error: 'The assistant is having trouble right now.' }, { status: 502 })
    }

    const data = await res.json()
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''

    return NextResponse.json({ reply: reply.trim() || 'Sorry, I didn’t catch that — could you rephrase?' })
  } catch (e) {
    console.error('Gemini request failed', e)
    return NextResponse.json({ error: 'Could not reach the assistant.' }, { status: 502 })
  }
}
