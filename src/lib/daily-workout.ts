import { db } from "@/lib/db"
import { EQUIPMENT_MAP } from "@/types"

function seededRand(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return (): number => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5
    return (h >>> 0) / 0xFFFFFFFF
  }
}

// Bodyweight / no-equipment values (always available)
const ALWAYS_AVAILABLE = new Set(["none", "aucun", "poids du corps", "au poids du corps", "bodyweight", ""])

function exerciseMatchesEquipment(equipmentLabel: string, userEquipment: string[]): boolean {
  const normalized = equipmentLabel.toLowerCase().trim()
  if (ALWAYS_AVAILABLE.has(normalized)) return true

  // Map French exercise label → profile key (e.g. "Haltères" → "dumbbells")
  const mappedKey = EQUIPMENT_MAP[equipmentLabel]
  if (mappedKey && (mappedKey === "none" || userEquipment.includes(mappedKey))) return true

  // Also try direct key match (in case exercises store keys directly)
  if (userEquipment.includes(normalized)) return true
  if (userEquipment.includes(equipmentLabel)) return true

  return false
}

export async function getDailyWorkout(userId: string, sessionId: string, userEquipment: string[] = []) {
  const today = new Date().toISOString().split("T")[0]
  const seed = `${userId}-${today}-${sessionId}`
  const rand = seededRand(seed)

  const template = await db.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      exercises: {
        orderBy: { order: "asc" },
        include: {
          exercise: {
            select: {
              id: true, slug: true, name: true, mainMuscle: true, level: true,
              equipment: true, defaultSets: true, restSeconds: true, instructions: true,
              safety: true, intensity: true, pattern: true, easyVariant: true,
              hardVariant: true, imageUrl: true,
            },
          },
        },
      },
    },
  })

  if (!template) return null

  const muscles = [...new Set(template.exercises.map((e) => e.exercise.mainMuscle))]

  const pool = await db.exercise.findMany({
    where: { mainMuscle: { in: muscles } },
    select: {
      id: true, slug: true, name: true, mainMuscle: true, level: true,
      equipment: true, defaultSets: true, restSeconds: true, instructions: true,
      safety: true, intensity: true, pattern: true, easyVariant: true,
      hardVariant: true, imageUrl: true,
    },
  })

  // Filter by available equipment (bodyweight always included)
  const available = userEquipment.length === 0
    ? pool  // no equipment saved yet → show everything (onboarding state)
    : pool.filter((ex) => exerciseMatchesEquipment(ex.equipment, userEquipment))

  const byMuscle: Record<string, typeof available> = {}
  for (const ex of available) {
    if (!byMuscle[ex.mainMuscle]) byMuscle[ex.mainMuscle] = []
    byMuscle[ex.mainMuscle].push(ex)
  }

  const dailyExercises = template.exercises.map((slot) => {
    const candidates = byMuscle[slot.exercise.mainMuscle] ?? []
    // If no equipment-compatible alternative exists, fall back to original
    if (candidates.length === 0) return slot
    const idx = Math.floor(rand() * candidates.length)
    return { ...slot, exercise: candidates[idx] }
  })

  return { ...template, exercises: dailyExercises, isVaried: true }
}
