import type { Niche, Signal, Tone, Platform } from './types'

export const TONE_INSTRUCTIONS: Record<Tone, string> = {
  contrarian: `Take a counterintuitive angle that challenges a belief most people in this niche hold without questioning.
    Frame it as something you discovered through experience, not something you're preaching.
    Make it slightly uncomfortable — the reader should think "wait, that might be true."`,

  story: `Open with a specific, personal moment — a real failure, realization, or turning point.
    "I [did X] for [Y time]." The emotional truth comes first, the insight comes last.
    Never start with the lesson — earn it through the story.`,

  hottake: `One bold, direct claim in the opening line. Back it up with a specific, unexpected observation.
    Short and punchy. Invite disagreement without being inflammatory.
    The reader should feel compelled to respond even if they agree.`,

  question: `Ask a question that forces genuine self-reflection — not rhetorical, not obvious.
    Something the reader has probably thought but never articulated.
    The setup before the question should create just enough tension that the question lands harder.`,

  framework: `Name a pattern you've noticed, then break it into 4-5 concrete steps or stages.
    The framework should feel like it was discovered, not invented.
    End with a reframe that shifts how the reader sees the whole thing.`,
}

export function buildResearchPrompt(niche: Niche): string {
  return `You are a social media intelligence agent. Search the web right now for what people in this specific niche are actively discussing, complaining about, celebrating, or debating.

NICHE: ${niche.name}
TOPIC: ${niche.topic}
AUDIENCE: ${niche.audience}

Search across:
- Reddit: relevant subreddits, top posts from the past 7 days, comment threads
- X (Twitter): trending threads, replies, quote-tweets with high engagement
- LinkedIn: viral posts, comment sections on controversial takes
- News and blogs: recent articles, opinion pieces, industry reports

For each signal you find, I need:
1. What the core tension or topic is
2. The EXACT language real people are using — not paraphrased, not cleaned up
3. Which platforms it's appearing on
4. How much traction it has (upvotes, comments, reactions, shares)
5. Whether it's high signal (major traction now), medium (solid ongoing discussion), or rising (gaining fast)

CRITICAL: The "quote" field must be something a real person actually wrote. Raw, specific, emotional. Not a summary. Not polished. If it sounds like marketing copy, it's wrong.

Return ONLY valid JSON — no markdown, no explanation:
{
  "signals": [
    {
      "rank": 1,
      "title": "concise title of the signal",
      "summary": "2-3 sentences on what people are saying and why it matters for content",
      "quote": "verbatim or near-verbatim quote capturing the raw sentiment",
      "sources": ["reddit", "x"],
      "strength": "high",
      "engagementNote": "e.g. 1.2k upvotes · 340 comments · r/getdisciplined"
    }
  ]
}

Find exactly 5 signals. Rank by content opportunity, not just engagement volume.`
}

export function buildXPostPrompt(niche: Niche, signal: Signal, tone: Tone, direction?: string): string {
  const toneInstruction = TONE_INSTRUCTIONS[tone]
  const voiceBlock = niche.voiceExamples.map((e, i) => `${i + 1}. "${e}"`).join('\n')

  return `You are a ghostwriter for a solo founder building an audience on X (Twitter).

NICHE: ${niche.name}
AUDIENCE: ${niche.audience}

THEIR VOICE — study these examples carefully and match this style exactly:
${voiceBlock}

SIGNAL GROUNDING — your post must feel like a direct reaction to this:
Topic: ${signal.title}
Context: ${signal.summary}
What real people are saying: "${signal.quote}"

TONE REQUIRED: ${toneInstruction}

WHAT HIGH-PERFORMING X POSTS IN THIS NICHE ACTUALLY LOOK LIKE:
- They open with a specific, surprising, or slightly uncomfortable truth — not a question, not a "hot take:" label
- They use short, punchy lines with a lot of white space — readers scan, not read
- They speak from personal experience, not from expertise
- The best ones make the reader think "I've felt this but never said it"
- They end by opening a door — a question, a challenge, an admission — never a call to action

ALGORITHM RULES — non-negotiable:
- Hook MUST be in the first line. The entire value of the post must be implied in line 1.
- Maximum 2 sentences before a line break
- NO hashtags — they suppress reach on X in 2025
- ZERO emojis unless one genuinely adds meaning — even then, only one
- End with a question or hot take that drives replies — replies are the highest-value engagement signal
- 150-280 chars for punchy posts, 300-500 for thread-starters
- Never start with "I" — it's a known reach suppressor on X

WHAT TO AVOID:
- Generic motivational tone ("success is a journey")
- Listicles with numbers in the hook ("5 reasons why...")
- Anything that sounds like it was written by an AI
- Clich\u00e9 self-improvement language ("level up", "hustle", "mindset shift")

${direction ? `USER DIRECTION: ${direction}` : ''}

Return ONLY valid JSON:
{
  "content": "post text with real \\n line breaks",
  "bestPostingTime": "e.g. Tue\u2013Thu \u00b7 8\u20139 am",
  "algoChecks": [
    { "label": "hook in line 1", "passed": true },
    { "label": "short punchy lines", "passed": true },
    { "label": "no hashtags", "passed": true },
    { "label": "reply bait close", "passed": true },
    { "label": "no emojis", "passed": true },
    { "label": "doesn't start with I", "passed": true }
  ]
}`
}

export function buildLinkedInPostPrompt(niche: Niche, signal: Signal, tone: Tone, direction?: string): string {
  const toneInstruction = TONE_INSTRUCTIONS[tone]
  const voiceBlock = niche.voiceExamples.map((e, i) => `${i + 1}. "${e}"`).join('\n')

  return `You are a ghostwriter for a professional building a thought leadership presence on LinkedIn.

NICHE: ${niche.name}
AUDIENCE: ${niche.audience}

THEIR VOICE:
${voiceBlock}

SIGNAL GROUNDING:
Topic: ${signal.title}
Context: ${signal.summary}
What real people are saying: "${signal.quote}"

TONE REQUIRED: ${toneInstruction}

WHAT HIGH-PERFORMING LINKEDIN POSTS IN THIS NICHE ACTUALLY LOOK LIKE:
- The first 2-3 lines are a standalone hook — they show before "see more" and must be impossible to scroll past
- The best performing posts in 2025 use professional vulnerability: "I made this mistake" beats "here's how to succeed"
- They tell a specific story with a real turning point — not a framework, not a theory
- Comment sections on top posts are full of "this happened to me too" — that's the goal
- They end with a question that makes professionals reflect on their own experience
- Single-sentence paragraphs dominate — LinkedIn is mobile-first and skim-first

ALGORITHM RULES — non-negotiable:
- First 2-3 lines MUST work as a complete hook before "see more"
- No more than 1-2 sentences per paragraph — line breaks every sentence on mobile
- 150-300 words for maximum reach — every word must earn its place
- End with a direct question inviting professionals to share their own experience
- Hashtags: maximum 2-3 at the very end if genuinely relevant — never in the body
- Never post a wall of text — white space is reach

WHAT TO AVOID:
- "I'm excited to share..."
- "Grateful for this opportunity..."
- Generic leadership advice
- Anything that sounds like a press release or corporate post
- Starting with "In today's world..."

${direction ? `USER DIRECTION: ${direction}` : ''}

Return ONLY valid JSON:
{
  "content": "post text with \\n line breaks",
  "bestPostingTime": "e.g. Tue\u2013Thu \u00b7 7\u20138 am or 12 pm",
  "algoChecks": [
    { "label": "hook in first 2-3 lines", "passed": true },
    { "label": "professional vulnerability", "passed": true },
    { "label": "single sentence paragraphs", "passed": true },
    { "label": "question close", "passed": true },
    { "label": "150-300 words", "passed": true },
    { "label": "no body hashtags", "passed": true }
  ]
}`
}

export function buildPostPrompt(
  platform: Platform,
  niche: Niche,
  signal: Signal,
  tone: Tone,
  direction?: string
): string {
  if (platform === 'linkedin') {
    return buildLinkedInPostPrompt(niche, signal, tone, direction)
  }
  return buildXPostPrompt(niche, signal, tone, direction)
}
