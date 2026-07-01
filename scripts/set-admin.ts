import "dotenv/config"
import { db } from "@/lib/db"

async function main() {
  const user = await db.user.findUnique({ where: { email: "seb.bouquet31@gmail.com" } })
  if (!user) {
    console.log("❌ User not found: seb.bouquet31@gmail.com")
    process.exit(1)
  }
  const updated = await db.user.update({
    where: { email: "seb.bouquet31@gmail.com" },
    data: { role: "admin" },
    select: { id: true, email: true, role: true },
  })
  console.log("✅ Admin set:", updated)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
