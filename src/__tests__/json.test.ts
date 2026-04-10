import { describe, it, expect } from 'vitest'
import { extractJSON } from '@/lib/json'

describe('extractJSON', () => {
  it('parses clean JSON directly', () => {
    const result = extractJSON('{"key": "value"}')
    expect(result).toEqual({ key: 'value' })
  })

  it('returns null for plain text', () => {
    expect(extractJSON('hello world')).toBeNull()
  })

  it('returns null for arrays', () => {
    expect(extractJSON('[1,2,3]')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractJSON('')).toBeNull()
  })

  it('strips markdown json code fences', () => {
    const input = '```json\n{"signals": [1,2,3]}\n```'
    expect(extractJSON(input)).toEqual({ signals: [1, 2, 3] })
  })

  it('strips plain markdown code fences', () => {
    const input = '```\n{"content": "hello"}\n```'
    expect(extractJSON(input)).toEqual({ content: 'hello' })
  })

  it('extracts JSON embedded in surrounding text', () => {
    const input = 'Here is the result:\n{"content": "post text"}\nDone!'
    expect(extractJSON(input)).toEqual({ content: 'post text' })
  })

  it('handles whitespace around JSON', () => {
    const input = '   \n  {"a": 1}  \n   '
    expect(extractJSON(input)).toEqual({ a: 1 })
  })

  it('handles nested objects', () => {
    const input = '{"outer": {"inner": true}}'
    expect(extractJSON(input)).toEqual({ outer: { inner: true } })
  })

  it('handles JSON with arrays inside', () => {
    const input = '{"signals": [{"rank": 1}, {"rank": 2}]}'
    const result = extractJSON(input)
    expect(result).not.toBeNull()
    expect(Array.isArray(result!.signals)).toBe(true)
    expect((result!.signals as unknown[]).length).toBe(2)
  })

  it('handles real AI research response format', () => {
    const input = `Here are the signals I found:
\`\`\`json
{
  "signals": [
    {
      "rank": 1,
      "title": "Test signal",
      "summary": "A test summary",
      "quote": "real person quote here",
      "sources": ["reddit", "x"],
      "strength": "high",
      "engagementNote": "1.2k upvotes"
    }
  ]
}
\`\`\`
I hope this helps!`
    const result = extractJSON(input)
    expect(result).not.toBeNull()
    expect(Array.isArray(result!.signals)).toBe(true)
  })

  it('handles real AI generate response format', () => {
    const input = `{
  "content": "Some post content\\nWith line breaks",
  "bestPostingTime": "Tue-Thu 8am",
  "algoChecks": [
    {"label": "hook in line 1", "passed": true},
    {"label": "no hashtags", "passed": true}
  ]
}`
    const result = extractJSON(input)
    expect(result).not.toBeNull()
    expect(result!.content).toBe('Some post content\nWith line breaks')
    expect(Array.isArray(result!.algoChecks)).toBe(true)
  })

  it('returns null for malformed JSON', () => {
    expect(extractJSON('{"key": value}')).toBeNull()
  })

  it('returns null for null/number primitives', () => {
    expect(extractJSON('null')).toBeNull()
    expect(extractJSON('42')).toBeNull()
    expect(extractJSON('"string"')).toBeNull()
  })
})
