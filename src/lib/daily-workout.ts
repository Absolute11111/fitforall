import { db } from "@/lib/db"

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

export async function getDailyWorkout(userId: string, sessionId: string) {
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

  const byMuscle: Record<string, typeof pool> = {}
  for (const ex of pool) {
    if (!byMuscle[ex.mainMuscle]) byMuscle[ex.mainMuscle] = []
    byMuscle[ex.mainMuscle].push(ex)
  }

  const dailyExercises = template.exercises.map((slot) => {
    const candidates = byMuscle[slot.exercise.mainMuscle] ?? []
    if (candidates.length === 0) return slot
    const idx = Math.floor(rand() * candidates.length)
    return { ...slot, exercise: candidates[idx] }
  })

  return { ...template, exercises: dailyExercises, isVaried: true }
}
