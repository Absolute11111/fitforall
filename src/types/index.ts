import type { Goal, Level } from "@/generated/prisma"

export type { Goal, Level }

export const GOAL_LABELS: Record<Goal, string> = {
  FAT_LOSS: "Perte de gras",
  MUSCLE_GAIN: "Prise de muscle",
  RECOMPOSITION: "Recomposition",
  HEALTH: "Forme / Santé",
  ENDURANCE: "Endurance",
}

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  ALL: "Tout niveau",
}

export function formatGoals(goals: Goal[]): string {
  if (!goals.length) return GOAL_LABELS.HEALTH
  return goals.map((g) => GOAL_LABELS[g]).join(" + ")
}

export const EQUIPMENT_OPTIONS = [
  { value: "none", label: "Aucun matériel" },
  { value: "mat", label: "Tapis" },
  { value: "chair", label: "Chaise" },
  { value: "elastic", label: "Élastique" },
  { value: "jump_rope", label: "Corde à sauter" },
  { value: "pullup_bar", label: "Barre de traction (optionnel)" },
  { value: "backpack", label: "Sac à dos lesté" },
  { value: "bottles", label: "Bouteilles d'eau" },
]

export type NutritionInfo = {
  calories: number
  proteins: number
  carbs: string
  lipids: string
  message: string
  warning: string
}

export type ExerciseCard = {
  id: string
  slug: string
  name: string
  mainMuscle: string
  level: Level
  equipment: string
  exerciseType: string
  intensity: number
  impact: number
  pattern: string | null
  defaultSets: string | null
  instructions: string | null
}

export type ProgramCard = {
  id: string
  slug: string
  name: string
  level: Level
  goal: Goal
  sessionDuration: number
  sessionsPerWeek: number
  structure: string | null
  nutritionNote: string | null
}

