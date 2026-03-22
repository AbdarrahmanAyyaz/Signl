import type { Niche, Signal, Tone, Platform } from './types'
import type { AccountIntelligence } from './types'

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  contrarian: `Challenge one specific belief that most people in this niche hold without
questioning. Not "here's the opposite view" — more like "here's the thing nobody
wants to say out loud." Make it uncomfortable but fair. The reader should pause,
feel slightly defensive, then think "actually... yeah."

Don't announce that you're being contrarian. Just be it.
No "hot take:" label. No "unpopular opinion:". State it plainly.

The post should feel like a calm person saying something true in a room full of
people who've been politely ignoring it.`,

  story: `Open with a specific moment — a physical action, a conversation, a thing that
happened. Not "I've been thinking about..." — something that actually occurred.
Concrete. Brief. Specific enough that the reader can picture it.

The insight comes LAST. Earn it through the story, don't announce it upfront.

The post should feel like something you told a friend over coffee that made them
say "wait, say that again."

Short lines. One thought per line. The story should take no more than 4-5 lines
before it pivots to what it means.`,

  hottake: `One sentence. That's the whole hook. It should be complete, surprising, and
slightly bruising. Everything after it is evidence.

Don't hedge. Don't qualify in the first three lines. State the thing, then
back it up with something specific — a pattern you've noticed, a number, a
moment that proves it.

The post should feel like something that would get screenshot-shared. Not because
it's inflammatory — because it's exactly right and nobody's said it that cleanly.

Under 200 characters for X. Under 150 words for LinkedIn.`,

  question: `Not a rhetorical question. A real one — the kind the reader has to actually
sit with before answering.

The best questions for this format have no clean answer. They expose a tension
the reader has been living with but hasn't named. Set it up with 2-3 lines of
context that create just enough pressure, then drop the question.

Then stop. Don't answer it for them. Don't add "let me know your thoughts."
Let it sit.

The discomfort is the point.`,

  observation: `You've noticed something true that most people haven't said out loud yet.
Not an opinion. Not advice. An observation — stated like a fact, but one that
only someone paying close attention would catch.

Open with the observation itself. Plain. Specific. Then show one example or
moment that confirms it. Then one implication — what it means if you take it
seriously.

No numbered lists. No framework. No "here's what I've learned."
Just: here's what I see. Here's one time I saw it. Here's what it means.

The reader should think: "I've noticed this too but never said it."`,
}

export function buildResearchPrompt(niche: Niche): string {
  return `You are a content intelligence agent. Your job is to find what people in a
specific niche are genuinely talking about right now — not what they should be
talking about, not what brands want them to talk about. What they actually are.

NICHE: ${niche.name}
TOPIC: ${niche.topic}
AUDIENCE: ${niche.audience}

Search Reddit, X (Twitter), LinkedIn, and recent news and blog articles from the
past 7 days. Look specifically for:

- Posts or threads with unusually high engagement relative to the account size
- Comments or replies that express frustration, confusion, or a strong opinion
- Questions that keep getting asked in multiple places
- A contrarian or counterintuitive take that's gaining traction
- Something that just happened in this niche that people are reacting to

For each signal, I need the RAW LANGUAGE people are using. Not a paraphrase.
Not a cleaned-up summary. The actual words — including the awkward ones, the
emotional ones, the ones that sound like a real person wrote them at 11pm.

The "quote" field is the most important field. If it sounds like a press release
or a LinkedIn post written by a marketer, it's wrong. It should sound like
something a frustrated or excited person typed without editing.

Bad quote: "Many professionals are experiencing challenges with productivity systems"
Good quote: "I've tried literally everything and I still can't make any of it stick"

Bad quote: "Users report dissatisfaction with current AI tools"
Good quote: "it just sounds like AI no matter what I do and I'm so tired of it"

Return ONLY valid JSON — no markdown, no preamble, no explanation:
{
  "signals": [
    {
      "rank": 1,
      "title": "Short, specific title — what the tension is in plain language",
      "summary": "2 sentences max. What people are saying and why it matters for content right now.",
      "quote": "Verbatim or near-verbatim. Sounds like a real person. Raw.",
      "sources": ["reddit", "x"],
      "strength": "high",
      "engagementNote": "Specific numbers where possible: e.g. 1.2k upvotes · 340 comments · r/getdisciplined"
    }
  ]
}

Find exactly 5 signals. Rank them by content opportunity — meaning: which one
would make the most interesting, most resonant post for this specific audience?
Not which one has the most upvotes.

Strength values: "high" (major traction right now), "medium" (solid ongoing
discussion), "rising" (gaining momentum fast, not peaked yet).

Sources must be from: "reddit", "x", "linkedin", "news". Use multiple where true.`
}

export function buildXPrompt(
  niche: Niche,
  signalTitle: string,
  signalSummary: string,
  signalQuote: string,
  tone: Tone,
  direction?: string,
  accountIntel?: AccountIntelligence
): string {
  return `You are ghostwriting a post for someone building an audience on X (Twitter).
They are not a brand. Not a marketer. Not a productivity guru.
They are a real person who has noticed something true about their niche and is saying it out loud.

THEIR NICHE: ${niche.name}
THEIR AUDIENCE: ${niche.audience}

THEIR VOICE — this is how they actually write. Study it. Match it exactly.
Not the topics. Not the ideas. The sentence rhythm, the line length, the way
they move from a concrete moment to an abstract insight:
${niche.voiceExamples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

${accountIntel?.xProfile ? `
THEIR ACTUAL X ACCOUNT CONTEXT — use this to write in genuine continuity with their real presence:

What their audience engages with most:
${accountIntel.xProfile.audienceSignals.map(s => `- ${s}`).join('\n')}

Their observed writing patterns from real posts:
${accountIntel.xProfile.writingPatterns.map(p => `- ${p}`).join('\n')}

Their best performing post (study this — match its structure and energy):
"${accountIntel.xProfile.topPerformingPost}"

Topics they have ALREADY covered — do not repeat these angles:
${accountIntel.xProfile.topicsToAvoid.map(t => `- ${t}`).join('\n')}

Their current top topics (find a fresh angle on these, don't repeat what they've said):
${accountIntel.xProfile.topTopics.map(t => `- ${t}`).join('\n')}
` : ''}

WHAT'S RESONATING IN THEIR NICHE RIGHT NOW:
Topic: ${signalTitle}
Context: ${signalSummary}
What a real person in this niche actually said: "${signalQuote}"

Your post should feel like a direct, honest reaction to this conversation —
not a summary of it, not advice about it. A reaction.

TONE: ${TONE_INSTRUCTIONS[tone]}

${direction ? `DIRECTION FROM THE USER: ${direction}\nPrioritise this above everything else.` : ''}

X ALGORITHM RULES — every single one is non-negotiable:
- Line 1 is everything. If it doesn't make someone stop scrolling, the post fails.
  A good line 1: specific, slightly unexpected, complete as a thought on its own.
  A bad line 1: "Here's something I've been thinking about." "We need to talk about X."
  "This is important." These are AI tells. Never use them.
- One sentence per line. Two maximum. Then a line break.
- 150–280 characters for punchy posts. 300–500 for thread-starters. Never longer.
- NO hashtags. They suppress reach on X in 2025. Not one.
- ONE emoji maximum. Ideally zero. Only if it genuinely adds meaning.
- Never start with "I" — known reach suppressor on X.
- The close should land like a door shutting. A declaration. A question that has
  no easy answer. NOT: "What do you think?" NOT: "Drop a comment below."
  NOT: "♻️ Repost if this resonates." — This is the single biggest tell that
  content was AI-generated. Never include it.

WHAT BAD OUTPUT LOOKS LIKE — avoid everything on this list:
- "In today's world..."
- "It's not about X, it's about Y"
- "Here's what nobody tells you:"
- "Level up", "mindset shift", "hustle", "grind", "10x"
- Numbered lists in the hook
- The word "journey"
- Ending with a soft call to action
- Any sentence that could appear unchanged in a post about a completely different topic

LENGTH RULE: If you can cut the last 2 lines and the post is stronger — cut them.
Most AI-generated posts are 30% too long. When in doubt, end one idea earlier.

Return ONLY valid JSON — no markdown, no explanation:
{
  "content": "post text with real \\n line breaks between each line",
  "bestPostingTime": "e.g. Tue–Thu · 8–9 am",
  "algoChecks": [
    { "label": "hook in line 1", "passed": true },
    { "label": "one sentence per line", "passed": true },
    { "label": "no hashtags", "passed": true },
    { "label": "strong close", "passed": true },
    { "label": "no AI tells", "passed": true },
    { "label": "under 300 chars", "passed": true }
  ]
}`
}

export function buildLinkedInPrompt(
  niche: Niche,
  signalTitle: string,
  signalSummary: string,
  signalQuote: string,
  tone: Tone,
  direction?: string,
  accountIntel?: AccountIntelligence
): string {
  return `You are ghostwriting a LinkedIn post for a founder building a professional audience.
They are not a thought leader performing for an audience.
They are a real person who figured something out and is sharing it honestly.

THEIR NICHE: ${niche.name}
THEIR AUDIENCE: ${niche.audience}

THEIR VOICE — read these carefully. This is the rhythm, the directness, the way they
move from a specific moment to a broader point. Every post you write must sound
like it came from the same person who wrote these:
${niche.voiceExamples.map((e, i) => `${i + 1}. "${e}"`).join('\n')}

${accountIntel?.linkedinProfile ? `
THEIR ACTUAL LINKEDIN ACCOUNT CONTEXT — use this to write in genuine continuity with their real presence:

What their audience engages with most:
${accountIntel.linkedinProfile.audienceSignals.map(s => `- ${s}`).join('\n')}

Their observed writing patterns from real posts:
${accountIntel.linkedinProfile.writingPatterns.map(p => `- ${p}`).join('\n')}

Their best performing post (study this — match its structure and energy):
"${accountIntel.linkedinProfile.topPerformingPost}"

Topics they have ALREADY covered — do not repeat these angles:
${accountIntel.linkedinProfile.topicsToAvoid.map(t => `- ${t}`).join('\n')}

IMPORTANT: The post you generate must feel like a natural continuation of this
person's existing content — same voice, same level of directness, same formatting
habits. A follower who reads this post after seeing their previous posts should
not notice any difference in who wrote it.
` : ''}

WHAT'S RESONATING IN THEIR NICHE RIGHT NOW:
Topic: ${signalTitle}
Context: ${signalSummary}
What real people in this niche are actually saying: "${signalQuote}"

TONE: ${TONE_INSTRUCTIONS[tone]}

${direction ? `DIRECTION FROM THE USER: ${direction}\nPrioritise this above everything else.` : ''}

WHAT PERFORMS ON LINKEDIN IN 2025:
The posts that get 1,000+ reactions in the founder/self-improvement/productivity space
have one thing in common: the writer admitted something real in the first three lines.
Not a vulnerability performance. A genuine admission — something uncomfortable that
most people in this space have experienced but won't say.

"I spent two years optimizing the wrong thing." works.
"Here are my top 5 lessons from building in public." doesn't.

The reader's first reaction should be: "I've felt that too."
Not: "That's inspiring." Inspiration is generic. Recognition is magnetic.

LINKEDIN FORMAT RULES — non-negotiable:
- Lines 1–3 are the hook. They show before "see more" on mobile. They must work
  completely standalone. Read them in isolation — do they make someone click?
- One sentence per paragraph. Two maximum. LinkedIn is read on phones, mostly
  while doing something else. Walls of text get scrolled past.
- 120–250 words is the sweet spot for reach. Every word past 200 needs to earn
  its place. If you're at 300 words, find the 80 that can go.
- The close should be a question the reader genuinely has to think about — or a
  statement that reframes everything above it. NOT "curious what you think."
  NOT "drop your thoughts below." NOT "let me know in the comments."
  These are weak closes that signal the writer ran out of things to say.
- 0–2 hashtags, only at the very end, only if genuinely relevant. Never in the body.

WHAT BAD LINKEDIN OUTPUT LOOKS LIKE — avoid every single one:
- "I'm excited to share..."
- "Grateful for this opportunity..."
- "In today's fast-paced world..."
- "As a [job title], I've learned..."
- "Here are [N] lessons from..."
- The word "journey" used to describe professional growth
- "♻️ Repost if this resonates" — never. This is the single biggest signal
  that content was generated by AI. Cut it from every post, always.
- Ending with a question that has an obvious answer
- Any motivational summary in the last paragraph
- Passive voice in the first three lines

CLOSE RULE: The last line should feel like the post has been building toward it.
If you removed it, something would be missing. If the post reads fine without it,
it's the wrong close — write a different one.

LENGTH RULE: Read the draft. Find the last paragraph. Ask: does this add something
the post doesn't already have, or does it just summarize what came before?
If it summarizes — cut it. The post was better one paragraph ago.

Return ONLY valid JSON — no markdown, no explanation:
{
  "content": "post text with \\n between each paragraph",
  "bestPostingTime": "e.g. Tue–Thu · 7–8 am or 12 pm",
  "algoChecks": [
    { "label": "hook in first 3 lines", "passed": true },
    { "label": "one sentence per para", "passed": true },
    { "label": "120–250 words", "passed": true },
    { "label": "strong close", "passed": true },
    { "label": "no AI tells", "passed": true },
    { "label": "no repost CTA", "passed": true }
  ]
}`
}

export function buildProfileScrapePrompt(
  niche: Niche,
  platform: 'x' | 'linkedin'
): string {
  const handle = platform === 'x' ? niche.xHandle : niche.linkedinHandle
  const profileUrl = platform === 'x'
    ? `https://x.com/${handle}`
    : `https://www.linkedin.com/in/${handle}`

  return `You are a social media analyst. Search for and analyse the recent public posts
from this ${platform === 'x' ? 'X (Twitter)' : 'LinkedIn'} profile:

Profile URL: ${profileUrl}
Handle: ${handle}
Niche context: ${niche.name} — ${niche.topic}

Search for their most recent 10 posts on ${platform === 'x' ? 'X' : 'LinkedIn'}.
For each post, find:
- The full post content (or as much as visible)
- Approximate engagement (likes/reactions, replies/comments, reposts if visible)
- Rough posting date

Then synthesise across all posts:

1. TOP TOPICS — what subjects do they post about most and get the best engagement on?
   Be specific. Not "productivity" — "the gap between knowing what to do and actually doing it."

2. WRITING PATTERNS — what stylistic habits do they have?
   e.g. "Opens with a physical scene before going abstract"
   e.g. "Uses short 1-sentence paragraphs"
   e.g. "Ends with a question, rarely a statement"
   e.g. "Rarely uses numbered lists"
   Be specific and observational — not evaluative.

3. BEST PERFORMING POST — which post got the most engagement?
   Include its full content if possible.

4. TOPICS TO AVOID — what have they already covered extensively?
   New posts should not repeat these angles.

5. AUDIENCE SIGNALS — what topics/angles get their audience responding most?
   Based on engagement patterns, what does their specific audience care about?

Return ONLY valid JSON — no markdown, no explanation:
{
  "handle": "${handle}",
  "recentPosts": [
    {
      "content": "full post text",
      "replies": 12,
      "reposts": 34,
      "likes": 156,
      "postedAt": "approx date e.g. 2025-03-10"
    }
  ],
  "topTopics": [
    "specific topic description",
    "another specific topic"
  ],
  "writingPatterns": [
    "Opens with a physical scene or concrete moment",
    "One sentence per line on LinkedIn",
    "Closes with a declaration not a question"
  ],
  "topPerformingPost": "full content of their best post",
  "avgEngagement": 145,
  "topicsToAvoid": [
    "already covered extensively e.g. AI replacing engineers"
  ],
  "audienceSignals": [
    "audience engages most with posts about failure and recovery",
    "systems thinking posts outperform motivational ones"
  ]
}`
}

export function buildPostPrompt(
  platform: Platform,
  niche: Niche,
  signal: Signal,
  tone: Tone,
  direction?: string,
  accountIntel?: AccountIntelligence
): string {
  const promptFn = platform === 'x' ? buildXPrompt : buildLinkedInPrompt
  return promptFn(
    niche,
    signal.title,
    signal.summary,
    signal.quote,
    tone,
    direction,
    accountIntel
  )
}
