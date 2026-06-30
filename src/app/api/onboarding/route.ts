import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { onboardingSchema } from "@/schemas"
import { scoreProgramForGoals } from "@/lib/nutrition"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { name, age, heightCm, currentWeightKg, targetWeightKg, targetWeeks, goals, level,
    sessionDuration, sessionsPerWeek, equipment, injuries, useWhey, useCreatine } = parsed.data

  await db.user.update({ where: { id: session.user.id }, data: { name } })

  await db.profile.upsert({
    where: { userId: session.user.id },
    update: { age, heightCm, currentWeightKg, targetWeightKg, targetWeeks, goals: goals as any, level: level as any, sessionDuration, sessionsPerWeek, equipment, injuries },
    create: { userId: session.user.id, age, heightCm, currentWeightKg, targetWeightKg, targetWeeks, goals: goals as any, level: level as any, sessionDuration, sessionsPerWeek, equipment, injuries },
  })

  await db.supplementPreferences.upsert({
    where: { userId: session.user.id },
    update: { useWhey, useCreatine },
    create: { userId: session.user.id, useWhey, useCreatine },
  })

  // Assign best matching program: score every program against the selected goals
  // (FAT_LOSS + MUSCLE_GAIN together favors RECOMPOSITION programs) and matching level.
  const candidates = await db.program.findMany({
    where: { OR: [{ level: level as any }, { level: "ALL" }] },
  })

  const best = candidates
    .map((p) => ({ program: p, score: scoreProgramForGoals(p.goal, goals as any) + (p.level === level ? 0.5 : 0) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.program

  if (best) {
    await db.userProgram.updateMany({ where: { userId: session.user.id, isActive: true }, data: { isActive: false } })
    await db.userProgram.create({ data: { userId: session.user.id, programId: best.id } })
  }

  return NextResponse.json({ ok: true })
}
