# Signl

Research-grounded social media content generator for **X (Twitter)** and **LinkedIn**.

Signl scans Reddit, X, LinkedIn, and news for what your niche audience is actively talking about, then generates platform-native posts that follow each platform's algorithm rules.

## How it works

1. **Research** — An AI agent surfaces 5 ranked signals from your audience, each with source, strength, and a verbatim quote
2. **Select** — Pick a signal, choose a platform (X or LinkedIn), and set a tone
3. **Generate** — Get a ready-to-post piece of content audited against platform-specific algorithm rules
4. **Post** — Copy and publish

## Tech stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS + Geist font
- **AI**: Google Gemini 2.0 Flash (primary) with Claude fallback
- **Storage**: Flat JSON files — no database needed

## Getting started

```bash
# Install dependencies
npm install

# Add your API keys
cp .env.example .env
# Edit .env with your GOOGLE_AI_API_KEY and ANTHROPIC_API_KEY

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The onboarding modal will walk you through niche setup.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Main app — brief + generator panels
│   ├── settings/page.tsx     # Niche config + voice profile
│   ├── history/page.tsx      # Post history
│   └── api/
│       ├── research/         # GET latest brief, POST run research agent
│       ├── generate/         # POST generate a post
│       ├── niche/            # GET/POST niche configuration
│       └── posts/            # GET post history
├── components/
│   ├── layout/               # AppShell, Sidebar
│   ├── brief/                # BriefPanel, SignalItem, EmptyBrief
│   ├── generator/            # GeneratorPanel, OutputCard, TonePicker, AlgoAudit
│   └── shared/               # SourceBadge, HeatPill, NicheChangeModal, LoadingSpinner
└── lib/
    ├── types.ts              # All TypeScript types
    ├── storage.ts            # File-based storage layer
    ├── ai.ts                 # Gemini + Claude client wrappers
    ├── prompts.ts            # All AI prompts
    └── json.ts               # JSON extraction utility
```

## License

Private — personal use only.
