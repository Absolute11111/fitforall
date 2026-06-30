import type { Goal } from "@/generated/prisma"

const GOAL_TARGETS: Record<Goal, { kcalOffset: number; proteinFactor: number; msg: string; warn: string }> = {
  FAT_LOSS: { kcalOffset: -400, proteinFactor: 2, msg: "Déficit léger + protéines élevées. La régularité prime sur la restriction.", warn: "Pas de restriction extrême — moins de 300 kcal/j de déficit c'est amplement suffisant." },
  MUSCLE_GAIN: { kcalOffset: 200, proteinFactor: 1.8, msg: "Surplus léger + progressivité. Priorise le sommeil et la récupération.", warn: "La prise de gras est normale — vise +200 kcal/j max." },
  RECOMPOSITION: { kcalOffset: 0, proteinFactor: 2, msg: "Protéines élevées, alimentation équilibrée. Idéal pour débuter ou reprendre.", warn: "Mesure ton tour de taille et tes photos plutôt que la balance." },
  HEALTH: { kcalOffset: 0, proteinFactor: 1.6, msg: "Manger mieux, bouger plus, dormir suffisamment. Simple et durable.", warn: "Pas besoin de compter chaque calorie." },
  ENDURANCE: { kcalOffset: 100, proteinFactor: 1.6, msg: "Glucides = carburant pour tes séances. Hydratation essentielle.", warn: "Mange suffisamment — sous-manger freine les progrès en endurance." },
}

const COMBO_MESSAGES: Record<string, string> = {
  "FAT_LOSS,MUSCLE_GAIN": "Perte de gras + Prise de muscle = recomposition corporelle. Déficit léger, protéines très élevées, renfo prioritaire.",
  "FAT_LOSS,RECOMPOSITION": "Objectifs alignés. Déficit léger et protéines élevées pour affiner tout en gardant le muscle.",
  "MUSCLE_GAIN,RECOMPOSITION": "Surplus très léger et protéines élevées pour prendre du muscle sans accumuler de gras.",
}

export function calcNutrition(weightKg: number, goals: Goal[] | Goal, heightCm?: number, age?: number) {
  const goalList = Array.isArray(goals) ? (goals.length ? goals : ["HEALTH" as Goal]) : [goals]
  const w = weightKg
  const h = heightCm ?? 175
  const a = age ?? 30
  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + 5)

  const targets = goalList.map((g) => GOAL_TARGETS[g])
  const avgOffset = Math.round(targets.reduce((s, t) => s + t.kcalOffset, 0) / targets.length)
  const maxProteinFactor = Math.max(...targets.map((t) => t.proteinFactor))

  const sortedKey = [...goalList].sort().join(",")
  const comboMsg = goalList.length > 1 ? COMBO_MESSAGES[sortedKey] : undefined

  return {
    bmr,
    kcal: bmr + avgOffset,
    proteins: Math.round(w * maxProteinFactor),
    carbs: goalList.includes("ENDURANCE") ? "Plus élevés" : "Modérés, autour entraînement",
    lipids: "0.8 g/kg",
    msg: comboMsg ?? targets[0].msg,
    warn: targets.map((t) => t.warn).filter((v, i, arr) => arr.indexOf(v) === i).join(" "),
  }
}

export function calcBmi(weightKg: number, heightCm: number) {
  return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
}

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return { label: "Sous-poids", color: "text-blue-400" }
  if (bmi < 25) return { label: "Normal", color: "text-green-400" }
  if (bmi < 30) return { label: "Surpoids", color: "text-yellow-400" }
  return { label: "Obésité", color: "text-red-400" }
}

/** Score un programme selon le recouvrement avec les objectifs choisis. Priorise RECOMPOSITION si fat loss + muscle gain sont tous deux sélectionnés. */
export function scoreProgramForGoals(programGoal: Goal, goals: Goal[]): number {
  if (goals.includes(programGoal)) return 2
  const hasFatLoss = goals.includes("FAT_LOSS")
  const hasMuscleGain = goals.includes("MUSCLE_GAIN")
  if (hasFatLoss && hasMuscleGain && programGoal === "RECOMPOSITION") return 3
  return 0
}
