import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/schemas"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

    const { email, password, name } = parsed.data
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    await db.user.create({ data: { email, name, password: hashed } })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
