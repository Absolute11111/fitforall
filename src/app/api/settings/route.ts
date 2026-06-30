import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { goals, gender, level, targetWeightKg, sessionDuration, sessionsPerWeek, useWhey, useCreatine, injuries } = await req.json()

  await db.profile.update({
    where: { userId: session.user.id },
    data: { goals, gender, level, targetWeightKg, sessionDuration, sessionsPerWeek, injuries },
  })

  await db.supplementPreferences.upsert({
    where: { userId: session.user.id },
    update: { useWhey, useCreatine },
    create: { userId: session.user.id, useWhey, useCreatine },
  })

  return NextResponse.json({ ok: true })
}
