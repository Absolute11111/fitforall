import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ExercisesClient } from "./exercises-client"
import type { Level } from "@/generated/prisma"

const PAGE_SIZE = 24

type SearchParams = Promise<{
  q?: string
  level?: string
  equipment?: string
  objective?: string
  bodyweight?: string
  page?: string
}>

export default async function ExercisesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { q, level, equipment, objective, bodyweight, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? "1") || 1)

  const validLevels: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]
  const levelFilter = level && level !== "all" && validLevels.includes(level as Level)
    ? { level: { in: [level as Level, "ALL" as Level] } }
    : {}

  const where = {
    AND: [
      q ? { name: { contains: q, mode: "insensitive" as const } } : {},
      levelFilter,
      equipment && equipment !== "all" ? { equipment } : {},
      objective && objective !== "all" ? { objective } : {},
      bodyweight === "true" ? { bodyweightOnly: true } : {},
    ],
  }

  const [exercises, total, [equipmentOptions, objectiveOptions]] = await Promise.all([
    db.exercise.findMany({
      where,
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy: { name: "asc" },
      select: {
        id: true, slug: true, name: true, mainMuscle: true, level: true,
        equipment: true, exerciseType: true, defaultSets: true, instructions: true,
        safety: true, intensity: true, impact: true, family: true, objective: true,
        bodyweightOnly: true, easyVariant: true, hardVariant: true, secondaryMuscles: true,
        restSeconds: true, imageUrl: true,
      },
    }),
    db.exercise.count({ where }),
    Promise.all([
      db.exercise.findMany({ select: { equipment: true }, distinct: ["equipment"], orderBy: { equipment: "asc" } }),
      db.exercise.findMany({ select: { objective: true }, distinct: ["objective"], orderBy: { objective: "asc" } }),
    ]),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <ExercisesClient
      exercises={exercises}
      total={total}
      totalPages={totalPages}
      currentPage={currentPage}
      currentFilters={{ q, level, equipment, objective, bodyweight }}
      equipmentOptions={equipmentOptions.filter((e) => e.equipment).map((e) => e.equipment!)}
      objectiveOptions={objectiveOptions.filter((o) => o.objective).map((o) => o.objective!)}
    />
  )
}
