import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { programId } = await req.json()
  if (!programId) return NextResponse.json({ error: "programId requis" }, { status: 400 })

  await db.userProgram.updateMany({ where: { userId: session.user.id, isActive: true }, data: { isActive: false } })
  await db.userProgram.create({ data: { userId: session.user.id, programId } })

  return NextResponse.json({ ok: true })
}
