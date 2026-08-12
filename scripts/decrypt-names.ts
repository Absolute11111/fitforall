import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { safeDecrypt } from "../src/lib/encrypt"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ENC_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true } })
  let fixed = 0

  for (const u of users) {
    if (!u.name) continue
    if (!ENC_RE.test(u.name)) continue  // already plaintext

    const decrypted = safeDecrypt(u.name)
    if (!decrypted || decrypted === u.name) continue  // nothing changed

    await prisma.user.update({ where: { id: u.id }, data: { name: decrypted } })
    console.log(`✓ ${u.id}: "${u.name.slice(0, 20)}..." → "${decrypted}"`)
    fixed++
  }

  console.log(`\n✅ ${fixed}/${users.length} noms déchiffrés`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
