import "dotenv/config"
import { db } from "@/lib/db"
import { encrypt, safeDecrypt } from "@/lib/encrypt"

async function main() {
  console.log("🔐 Re-chiffrement des données existantes...")

  // Re-encrypt User.name
  const users = await db.user.findMany({ select: { id: true, name: true } })
  let uCount = 0
  for (const u of users) {
    if (!u.name) continue
    // safeDecrypt first (in case already encrypted), then encrypt cleanly
    const plain = safeDecrypt(u.name) ?? u.name
    const enc = encrypt(plain)
    await db.user.update({ where: { id: u.id }, data: { name: enc } })
    uCount++
  }
  console.log(`✅ ${uCount} noms d'utilisateurs chiffrés`)

  // Re-encrypt Profile.gender + injuries
  const profiles = await db.profile.findMany({
    select: { id: true, gender: true, injuries: true },
  })
  let pCount = 0
  for (const p of profiles) {
    const data: Record<string, string> = {}
    if (p.gender) data.gender = encrypt(safeDecrypt(p.gender) ?? p.gender)
    if (p.injuries) data.injuries = encrypt(safeDecrypt(p.injuries) ?? p.injuries)
    if (Object.keys(data).length) {
      await db.profile.update({ where: { id: p.id }, data })
      pCount++
    }
  }
  console.log(`✅ ${pCount} profils chiffrés (genre + blessures)`)

  console.log("\n📊 Résumé sécurité :")
  console.log("  • Mots de passe    → bcrypt (one-way, irréversible)")
  console.log("  • Noms, genre      → AES-256-GCM (chiffrement applicatif)")
  console.log("  • Blessures        → AES-256-GCM (chiffrement applicatif)")
  console.log("  • Poids/mesures    → chiffrés au repos par Neon (SSL + AES-256)")
  console.log("  • Transit réseau   → TLS 1.3 (Neon + Vercel)")
  console.log("  • Clé ENCRYPTION_KEY → var d'env, jamais en git")

  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
