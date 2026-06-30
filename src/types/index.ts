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
  { value: "mat", label: "Tapis de sol", emoji: "🟫", desc: "Indispensable pour les exercices au sol" },
  { value: "jump_rope", label: "Corde à sauter", emoji: "🪢", desc: "Cardio ultra-efficace, remplace jumping jacks × 3" },
  { value: "elastic", label: "Élastique de résistance", emoji: "🫀", desc: "Complète les exercices de tirage sans barre" },
  { value: "dumbbells", label: "Haltères", emoji: "🏋️", desc: "Ajoute de la charge pour prise de muscle" },
  { value: "pullup_bar", label: "Barre de traction", emoji: "⬆️", desc: "Dos et biceps — à fixer dans une porte" },
  { value: "kettlebell", label: "Kettlebell", emoji: "⚫", desc: "Polyvalent, idéal pour swing et circuit training" },
  { value: "barbell", label: "Barre olympique", emoji: "🏋️", desc: "Pour squats, développés, soulevés de terre" },
  { value: "chair", label: "Chaise / banc", emoji: "🪑", desc: "Dips, step-up, split squat bulgare" },
  { value: "backpack", label: "Sac à dos lesté", emoji: "🎒", desc: "Remplacement économique des haltères" },
  { value: "bottles", label: "Bouteilles lestées", emoji: "🧴", desc: "Quelques kilos pour les épaules et biceps" },
  { value: "foam_roller", label: "Foam roller", emoji: "🫀", desc: "Récupération et mobilité musculaire" },
  { value: "step", label: "Step / marche", emoji: "📦", desc: "Cardio et step-up sans impact" },
  { value: "trx", label: "TRX / sangles", emoji: "🪢", desc: "Entraînement au poids du corps suspendu" },
  { value: "bike", label: "Vélo d'appartement", emoji: "🚴", desc: "Cardio sans impact articulaire" },
  { value: "rower", label: "Rameur", emoji: "🚣", desc: "Full body cardio — dos, jambes, bras" },
]

export const EQUIPMENT_MAP: Record<string, string> = {
  "Corde à sauter": "jump_rope",
  "Élastique": "elastic",
  "Haltères": "dumbbells",
  "Barre de traction optionnelle": "pullup_bar",
  "Barre traction optionnelle": "pullup_bar",
  "Kettlebell": "kettlebell",
  "Barre": "barbell",
  "Chaise": "chair",
  "Tapis": "mat",
  "Poids du corps": "none",
  "Aucun": "none",
}

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

