import type { Goal } from "@/generated/prisma"

const WEIGHT_MILESTONE_MESSAGES: Record<Goal, string[]> = {
  FAT_LOSS: [
    "Premier quart parcouru. Le plus dur — démarrer — c'est fait.",
    "À mi-chemin ! Ton corps s'adapte, ton énergie suit. Continue.",
    "Plus que la dernière ligne droite. La régularité a payé jusqu'ici.",
    "Objectif atteint. Tu as prouvé que la patience fonctionne mieux que la restriction.",
  ],
  MUSCLE_GAIN: [
    "25% du chemin. Le volume vient, la force aussi — sois patient.",
    "Mi-parcours. Les fibres se reconstruisent plus fortes à chaque séance.",
    "75% franchis. Ton corps a clairement changé, même si le miroir va lentement.",
    "Objectif atteint. Du muscle construit séance après séance, sans raccourci.",
  ],
  RECOMPOSITION: [
    "Premier quart. Le poids ne bougera pas vite — c'est normal, c'est la composition qui change.",
    "Mi-chemin. Regarde tes photos et ton tour de taille, pas seulement la balance.",
    "75% parcourus. Ce double objectif est le plus exigeant — bravo pour la régularité.",
    "Objectif atteint. Perdre du gras et prendre du muscle en même temps, c'est rare et c'est fait.",
  ],
  HEALTH: [
    "Premier quart. Bouger régulièrement devient une habitude — c'est déjà une victoire.",
    "Mi-chemin. Ton énergie au quotidien a probablement déjà changé.",
    "75% du chemin. Le sport fait maintenant partie de ta routine.",
    "Objectif atteint. Tu as construit une habitude durable, pas un sprint temporaire.",
  ],
  ENDURANCE: [
    "25% parcourus. Ton cœur et tes poumons s'adaptent déjà.",
    "Mi-chemin. Le souffle qui manquait au début revient plus facilement.",
    "75% franchis. Ton endurance de base a nettement progressé.",
    "Objectif atteint. Ce qui semblait épuisant au départ est devenu gérable.",
  ],
}

const SESSION_MILESTONES: { threshold: number; label: string }[] = [
  { threshold: 5, label: "5 séances" },
  { threshold: 10, label: "10 séances" },
  { threshold: 25, label: "25 séances" },
  { threshold: 50, label: "50 séances" },
  { threshold: 100, label: "100 séances" },
]

const SESSION_MESSAGES: Record<Goal, string[]> = {
  FAT_LOSS: [
    "5 séances faites. L'habitude se construit, le déficit aussi.",
    "10 séances. Tu n'es plus dans la phase \"essai\" — c'est devenu un mode de vie.",
    "25 séances. À ce rythme, les résultats deviennent visibles et durables.",
    "50 séances. Un demi-siècle d'efforts cumulés — impressionnant.",
    "100 séances. Tu es la preuve vivante que la régularité bat l'intensité.",
  ],
  MUSCLE_GAIN: [
    "5 séances. Les premières adaptations neuromusculaires sont en cours.",
    "10 séances. La technique s'affine, la charge va suivre.",
    "25 séances. La surcharge progressive commence à payer.",
    "50 séances. Du volume sérieux accumulé — ça se voit.",
    "100 séances. Un travail de fond qui forge un physique solide.",
  ],
  RECOMPOSITION: [
    "5 séances. Renfo + cardio, le combo le plus complet, déjà amorcé.",
    "10 séances. Patience — la recomposition prend du temps mais elle est en cours.",
    "25 séances. Régularité exemplaire pour l'objectif le plus exigeant.",
    "50 séances. Le changement de composition corporelle est désormais net.",
    "100 séances. Rares sont ceux qui tiennent ce rythme sur ce double objectif.",
  ],
  HEALTH: [
    "5 séances. Tu as passé le cap du démarrage — bravo.",
    "10 séances. Le sport entre dans ta routine naturellement.",
    "25 séances. Une vraie habitude de vie, pas une mode passagère.",
    "50 séances. Ton corps et ton mental en ressentent les bénéfices au quotidien.",
    "100 séances. Un mode de vie actif, ancré durablement.",
  ],
  ENDURANCE: [
    "5 séances. Le souffle commence déjà à s'améliorer.",
    "10 séances. Ta capacité cardio progresse séance après séance.",
    "25 séances. Une base d'endurance solide est posée.",
    "50 séances. Ton cœur travaille plus efficacement, c'est mesurable.",
    "100 séances. Une endurance forgée sur la durée, pas sur un coup de chance.",
  ],
}

export type WeightMilestone = { threshold: number; reached: boolean; message: string }

export function getWeightMilestones(goals: Goal[], progressPct: number): WeightMilestone[] {
  const primary = goals[0] ?? "HEALTH"
  const messages = WEIGHT_MILESTONE_MESSAGES[primary]
  return [25, 50, 75, 100].map((threshold, i) => ({
    threshold,
    reached: progressPct >= threshold,
    message: messages[i],
  }))
}

export type SessionMilestone = { threshold: number; label: string; reached: boolean; message: string }

export function getSessionMilestones(goals: Goal[], sessionCount: number): SessionMilestone[] {
  const primary = goals[0] ?? "HEALTH"
  const messages = SESSION_MESSAGES[primary]
  return SESSION_MILESTONES.map((m, i) => ({
    ...m,
    reached: sessionCount >= m.threshold,
    message: messages[i],
  }))
}

/** Dernier palier franchi (poids ou séances), pour mettre en avant le message le plus récent. */
export function getLatestMilestoneMessage(goals: Goal[], progressPct: number, sessionCount: number): string | null {
  const weightMilestones = getWeightMilestones(goals, progressPct)
  const sessionMilestones = getSessionMilestones(goals, sessionCount)
  const lastWeight = [...weightMilestones].reverse().find((m) => m.reached)
  const lastSession = [...sessionMilestones].reverse().find((m) => m.reached)
  if (lastSession) return lastSession.message
  if (lastWeight) return lastWeight.message
  return null
}
