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

// Equipment labels that never require special gear
const ALWAYS_AVAILABLE = new Set([
  "none", "aucun", "poids du corps", "au poids du corps", "bodyweight", "",
])

function exerciseMatchesEquipment(
  equipmentLabel: string,
  bodyweightOnly: boolean,
  userEquipment: string[],
): boolean {
  // Explicit bodyweight flag — always OK
  if (bodyweightOnly) return true

  const normalized = (equipmentLabel ?? "").toLowerCase().trim()

  // No-equipment labels — always OK
  if (ALWAYS_AVAILABLE.has(normalized)) return true

  // Map French label → profile key (e.g. "Haltères" → "dumbbells")
  const mappedKey = EQUIPMENT_MAP[equipmentLabel]
  if (mappedKey) {
    if (mappedKey === "none") return true
    if (userEquipment.includes(mappedKey)) return true
  }

  // Direct key match as fallback
  if (userEquipment.includes(normalized)) return true
  if (userEquipment.includes(equipmentLabel)) return true

  return false
}

export async function getDailyWorkout(userId: string, sessionId: string, userEquipment: string[] = []) {
  const today = new Date().toISOString().split("T")[0]
  // v2 in seed invalidates any server-side caching from before the equipment fix
  const seed = `${userId}-${today}-${sessionId}-v2`
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
              equipment: true, bodyweightOnly: true, defaultSets: true, restSeconds: true,
              instructions: true, safety: true, intensity: true, pattern: true,
              easyVariant: true, hardVariant: true, imageUrl: true,
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
      equipment: true, bodyweightOnly: true, defaultSets: true, restSeconds: true,
      instructions: true, safety: true, intensity: true, pattern: true,
      easyVariant: true, hardVariant: true, imageUrl: true,
    },
  })

  // Filter: keep only exercises doable with user's equipment.
  // Empty equipment = bodyweight only (most restrictive, not "show all").
  const available = pool.filter((ex) =>
    exerciseMatchesEquipment(ex.equipment, ex.bodyweightOnly, userEquipment)
  )

  const byMuscle: Record<string, typeof available> = {}
  for (const ex of available) {
    if (!byMuscle[ex.mainMuscle]) byMuscle[ex.mainMuscle] = []
    byMuscle[ex.mainMuscle].push(ex)
  }

  const dailyExercises = template.exercises.map((slot) => {
    const candidates = byMuscle[slot.exercise.mainMuscle] ?? []
    // If no equipment-compatible alternative exists, keep original (no crash)
    if (candidates.length === 0) return slot
    const idx = Math.floor(rand() * candidates.length)
    return { ...slot, exercise: candidates[idx] }
  })

  return { ...template, exercises: dailyExercises, isVaried: true }
}
