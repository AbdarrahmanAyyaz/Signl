export const COPY = {
  limits: {
    briefHit: {
      title: "You've run 2 briefs today.",
      body: "Free plan resets at midnight. Pro users get a fresh brief every morning automatically — no manual refresh needed.",
      cta: "Upgrade to Pro — $19/mo →",
      secondary: "← Back to today's brief",
    },
    postHit: {
      title: "You've used all 5 posts this month.",
      body: (resetDate: string, avgPosts: number) =>
        `Free resets on ${resetDate}. Pro users generated an average of ${avgPosts} posts last month.`,
      cta: "Upgrade to Pro — $19/mo →",
    },
    planIntro: {
      fomo: "Most free users upgrade within their first week.",
      briefs: "After that, signals wait til tomorrow. Pro refreshes every day automatically at 7am.",
      posts: "That's 5 chances to get it right. Pro users generate unlimited posts.",
    },
  },
} as const
