import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { equipment } = await req.json()
  if (!Array.isArray(equipment)) return NextResponse.json({ error: "Format invalide" }, { status: 400 })

  await db.profile.update({
    where: { userId: session.user.id },
    data: { equipment },
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { equipment: true },
  })

  return NextResponse.json({ equipment: profile?.equipment ?? [] })
}
