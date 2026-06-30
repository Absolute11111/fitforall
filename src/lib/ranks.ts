import type { Goal } from "@/generated/prisma"

export type Rank = {
  id: string
  name: string
  subtitle: string
  minSessions: number
  maxSessions: number | null
  color: string          // Tailwind text color
  bgColor: string        // Tailwind bg color (card bg)
  borderColor: string    // Tailwind border color
  glowColor: string      // CSS color for glow/shadow
  emoji: string
  quote: string
  description: string
}

export const RANKS: Rank[] = [
  {
    id: "recrue",
    name: "RECRUE",
    subtitle: "Le voyage commence",
    minSessions: 0,
    maxSessions: 4,
    color: "text-zinc-400",
    bgColor: "bg-zinc-800/50",
    borderColor: "border-zinc-600",
    glowColor: "rgba(161,161,170,0.3)",
    emoji: "🎯",
    quote: "Chaque légende a commencé par une première séance.",
    description: "Tu viens de rejoindre FitForAll. Le chemin commence maintenant.",
  },
  {
    id: "challenger",
    name: "CHALLENGER",
    subtitle: "L'habitude se forme",
    minSessions: 5,
    maxSessions: 9,
    color: "text-teal-400",
    bgColor: "bg-teal-900/30",
    borderColor: "border-teal-500",
    glowColor: "rgba(45,212,191,0.3)",
    emoji: "⚡",
    quote: "5 séances, c'est déjà plus que 80% des gens.",
    description: "Tu as passé le cap du démarrage. L'habitude commence à se former.",
  },
  {
    id: "combattant",
    name: "COMBATTANT",
    subtitle: "L'engagement est réel",
    minSessions: 10,
    maxSessions: 24,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
    glowColor: "oklch(0.91 0.21 124 / 0.35)",
    emoji: "💪",
    quote: "10 séances prouvent que tu n'es pas là pour essayer, tu es là pour progresser.",
    description: "L'engagement est là. Ton corps commence à répondre.",
  },
  {
    id: "guerrier",
    name: "GUERRIER",
    subtitle: "La discipline s'installe",
    minSessions: 25,
    maxSessions: 49,
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-500",
    glowColor: "rgba(96,165,250,0.35)",
    emoji: "🔥",
    quote: "25 séances. Ce n'est plus un effort, c'est un mode de vie.",
    description: "La discipline est ancrée. Les résultats sont visibles et durables.",
  },
  {
    id: "athlete",
    name: "ATHLÈTE",
    subtitle: "Sérieux et constant",
    minSessions: 50,
    maxSessions: 99,
    color: "text-violet-400",
    bgColor: "bg-violet-900/30",
    borderColor: "border-violet-500",
    glowColor: "rgba(167,139,250,0.35)",
    emoji: "🏅",
    quote: "50 séances. Tu es dans le top 10% des personnes qui s'entraînent.",
    description: "Un athlète sérieux. La constance est ton super-pouvoir.",
  },
  {
    id: "champion",
    name: "CHAMPION",
    subtitle: "Au-delà de la moyenne",
    minSessions: 100,
    maxSessions: 199,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-500",
    glowColor: "rgba(250,204,21,0.35)",
    emoji: "🏆",
    quote: "100 séances. La majorité abandonne avant d'arriver là.",
    description: "Champion. Ce titre se mérite — et tu l'as mérité.",
  },
  {
    id: "elite",
    name: "ÉLITE",
    subtitle: "Le haut du podium",
    minSessions: 200,
    maxSessions: 499,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent",
    glowColor: "oklch(0.66 0.2 28 / 0.35)",
    emoji: "💎",
    quote: "200 séances. Tu as redéfinit ce que tu croyais possible.",
    description: "Élite. Peu atteignent ce niveau. Tu es une référence.",
  },
  {
    id: "legende",
    name: "LÉGENDE",
    subtitle: "Hors catégorie",
    minSessions: 500,
    maxSessions: null,
    color: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-primary to-accent",
    bgColor: "bg-gradient-to-br from-yellow-900/30 via-primary/10 to-accent/10",
    borderColor: "border-yellow-400",
    glowColor: "rgba(255,200,50,0.4)",
    emoji: "👑",
    quote: "500 séances. Tu n'as plus rien à prouver — mais tu continues quand même.",
    description: "Légende. Un statut que moins d'1% des sportifs atteignent.",
  },
]

export function getCurrentRank(sessionCount: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (sessionCount >= RANKS[i].minSessions) return RANKS[i]
  }
  return RANKS[0]
}

export function getNextRank(sessionCount: number): Rank | null {
  const current = getCurrentRank(sessionCount)
  const currentIdx = RANKS.findIndex((r) => r.id === current.id)
  return currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null
}

export function getRankProgress(sessionCount: number): {
  current: Rank
  next: Rank | null
  sessionsInCurrentRank: number
  sessionsNeededForNext: number
  pct: number
} {
  const current = getCurrentRank(sessionCount)
  const next = getNextRank(sessionCount)
  const sessionsInCurrentRank = sessionCount - current.minSessions
  const sessionsNeededForNext = next ? next.minSessions - current.minSessions : 1
  const pct = next ? Math.min(100, Math.round((sessionsInCurrentRank / sessionsNeededForNext) * 100)) : 100
  return { current, next, sessionsInCurrentRank, sessionsNeededForNext, pct }
}
