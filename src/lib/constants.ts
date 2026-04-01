export const LIMITS = {
  free: {
    postsPerMonth: 5,
    briefsPerDay: 2,
  },
  pro: {
    postsPerMonth: Infinity,
    briefsPerDay: Infinity,
  },
} as const
