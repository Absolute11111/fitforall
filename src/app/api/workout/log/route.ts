import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { programSessionId, durationMin, rpe, notes } = await req.json()

  await db.workoutLog.create({
    data: { userId: session.user.id, programSessionId, durationMin, rpe, notes },
  })

  return NextResponse.json({ ok: true })
}
