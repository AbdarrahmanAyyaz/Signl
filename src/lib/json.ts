/**
 * Robustly extracts a JSON object from an AI model response string.
 *
 * Handles common edge cases:
 * - Markdown code blocks (```json ... ``` or ``` ... ```)
 * - Leading/trailing text around the JSON
 * - Extra whitespace
 *
 * Returns the parsed object, or null if extraction fails.
 */
export function extractJSON(text: string): Record<string, unknown> | null {
  const trimmed = text.trim()

  // 1. Try direct parse first (best case: clean JSON)
  try {
    const result = JSON.parse(trimmed)
    if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
      return result as Record<string, unknown>
    }
  } catch {
    // continue to fallback strategies
  }

  // 2. Strip markdown code block fences (```json or ```)
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    try {
      const result = JSON.parse(codeBlockMatch[1].trim())
      if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
        return result as Record<string, unknown>
      }
    } catch {
      // continue
    }
  }

  // 3. Find first { and last } to extract embedded JSON object
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const result = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1))
      if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
        return result as Record<string, unknown>
      }
    } catch {
      // continue
    }
  }

  return null
}
