import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { weightKg, waistCm, energyLevel } = await req.json()

  await db.measurement.create({
    data: { userId: session.user.id, weightKg, waistCm, energyLevel },
  })

  return NextResponse.json({ ok: true })
}
