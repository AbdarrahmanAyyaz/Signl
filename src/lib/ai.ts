import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

// --- Gemini (primary) ---

export async function runGeminiResearch(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} } as any],
  })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function runGeminiGenerate(systemPrompt: string, userPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const combined = systemPrompt
    ? `${systemPrompt}\n\n${userPrompt}`
    : userPrompt
  const result = await model.generateContent(combined)
  return result.response.text()
}

// --- Anthropic (fallback) ---

export async function runClaudeResearch(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' as const }],
    messages: [{ role: 'user', content: prompt }],
  })
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
}

export async function runClaudeGenerate(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [{ role: 'user', content: userPrompt }],
  })
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
}

// --- Unified wrappers with fallback ---

export async function runResearch(prompt: string): Promise<{ text: string; model: string }> {
  try {
    console.log('[AI] Running research with Gemini 2.5 Flash...')
    const text = await runGeminiResearch(prompt)
    console.log('[AI] Research complete (model: gemini-2.5-flash)')
    return { text, model: 'gemini-2.5-flash' }
  } catch (err) {
    console.warn('[AI] Gemini research failed, falling back to Claude Haiku:', err)
    try {
      const text = await runClaudeResearch(prompt)
      console.log('[AI] Research complete (model: claude-haiku-4-5-20251001)')
      return { text, model: 'claude-haiku-4-5-20251001' }
    } catch (err2) {
      console.error('[AI] Claude research also failed:', err2)
      throw new Error('Both Gemini and Claude research failed')
    }
  }
}

export async function runGenerate(systemPrompt: string, userPrompt: string): Promise<{ text: string; model: string }> {
  try {
    console.log('[AI] Running generation with Gemini 2.5 Flash...')
    const text = await runGeminiGenerate(systemPrompt, userPrompt)
    console.log('[AI] Generation complete (model: gemini-2.5-flash)')
    return { text, model: 'gemini-2.5-flash' }
  } catch (err) {
    console.warn('[AI] Gemini generation failed, falling back to Claude Sonnet:', err)
    try {
      const text = await runClaudeGenerate(systemPrompt, userPrompt)
      console.log('[AI] Generation complete (model: claude-sonnet-4-6)')
      return { text, model: 'claude-sonnet-4-6' }
    } catch (err2) {
      console.error('[AI] Claude generation also failed:', err2)
      throw new Error('Both Gemini and Claude generation failed')
    }
  }
}
