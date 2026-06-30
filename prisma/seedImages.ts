import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

// Fallback images by pattern
const PATTERN_FALLBACK: Record<string, string> = {
  Push: `${BASE}/Incline_Push-Up/0.jpg`,
  Pull: `${BASE}/Bodyweight_Mid_Row/0.jpg`,
  Legs: `${BASE}/Bodyweight_Squat/0.jpg`,
  Core: `${BASE}/Plank/0.jpg`,
  Cardio: `${BASE}/Mountain_Climbers/0.jpg`,
  "Cardio-Corde": `${BASE}/Mountain_Climbers/0.jpg`,
  Full: `${BASE}/Mountain_Climbers/0.jpg`,
  Mobility: `${BASE}/Superman/0.jpg`,
  Recovery: `${BASE}/Superman/0.jpg`,
}

// Manual mapping: slug → image URL
const SLUG_MAP: Record<string, string> = {
  // ── Pompes / Push ──────────────────────────────────────
  EX001: `${BASE}/Incline_Push-Up/0.jpg`,        // pompes inclinées
  EX002: `${BASE}/Decline_Push-Up/0.jpg`,        // pompes classiques
  EX003: `${BASE}/Incline_Push-Up/0.jpg`,        // pompes genoux
  EX004: `${BASE}/Body_Tricep_Press/0.jpg`,      // pompes diamant
  EX005: `${BASE}/Bench_Dips/0.jpg`,             // dips chaise
  EX021: `${BASE}/Decline_Push-Up/0.jpg`,        // pike push-up
  EX030: `${BASE}/Decline_Push-Up/0.jpg`,        // pompes tempo
  EX036: `${BASE}/Decline_Push-Up/0.jpg`,        // pompes explosives
  EX044: `${BASE}/Incline_Push-Up/0.jpg`,        // pompes scapulaires
  EX048: `${BASE}/Bodyweight_Flyes/0.jpg`,       // pompes larges

  // ── Jambes / Legs ─────────────────────────────────────
  EX006: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat poids du corps
  EX007: `${BASE}/Bodyweight_Walking_Lunge/0.jpg`,// fentes arrière
  EX008: `${BASE}/Bodyweight_Walking_Lunge/0.jpg`,// split squat bulgare
  EX009: `${BASE}/Bent-Knee_Hip_Raise/0.jpg`,   // pont fessier
  EX010: `${BASE}/Bent-Knee_Hip_Raise/0.jpg`,   // hip thrust une jambe
  EX022: `${BASE}/Bodyweight_Squat/0.jpg`,       // wall sit
  EX023: `${BASE}/Bodyweight_Squat/0.jpg`,       // mollets debout
  EX024: `${BASE}/Bodyweight_Walking_Lunge/0.jpg`,// step-up chaise
  EX026: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat jump
  EX029: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat tempo
  EX031: `${BASE}/Bodyweight_Squat/0.jpg`,       // good morning sac
  EX037: `${BASE}/Bodyweight_Walking_Lunge/0.jpg`,// fentes marchées
  EX045: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat sumo
  EX049: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat isométrique
  EX051: `${BASE}/Bent-Knee_Hip_Raise/0.jpg`,   // kickback fessier
  EX052: `${BASE}/Bent-Knee_Hip_Raise/0.jpg`,   // fire hydrant
  EX053: `${BASE}/Bent-Knee_Hip_Raise/0.jpg`,   // pont fessier pulsé
  EX054: `${BASE}/Bodyweight_Squat/0.jpg`,       // squat sumo pulse
  EX055: `${BASE}/Bodyweight_Walking_Lunge/0.jpg`,// fente latérale

  // ── Dos / Pull ────────────────────────────────────────
  EX018: `${BASE}/Superman/0.jpg`,               // superman hold
  EX019: `${BASE}/Bodyweight_Mid_Row/0.jpg`,     // rowing serviette porte
  EX020: `${BASE}/Band_Assisted_Pull-Up/0.jpg`,  // tractions négatives
  EX032: `${BASE}/Bodyweight_Mid_Row/0.jpg`,     // curl biceps élastique
  EX033: `${BASE}/Bodyweight_Mid_Row/0.jpg`,     // rowing élastique

  // ── Épaules ───────────────────────────────────────────
  EX034: `${BASE}/Decline_Push-Up/0.jpg`,        // développé épaules élastique
  EX035: `${BASE}/Decline_Push-Up/0.jpg`,        // élévations bouteilles

  // ── Core / Gainage ────────────────────────────────────
  EX011: `${BASE}/Mountain_Climbers/0.jpg`,      // mountain climbers
  EX014: `${BASE}/Plank/0.jpg`,                  // planche avant
  EX015: `${BASE}/Plank/0.jpg`,                  // planche latérale
  EX016: `${BASE}/Plank/0.jpg`,                  // dead bug
  EX017: `${BASE}/Plank/0.jpg`,                  // hollow hold
  EX027: `${BASE}/Plank/0.jpg`,                  // shoulder taps
  EX028: `${BASE}/3_4_Sit-Up/0.jpg`,            // crunch inversé
  EX046: `${BASE}/Plank/0.jpg`,                  // planche commando

  // ── Cardio ────────────────────────────────────────────
  EX012: `${BASE}/Mountain_Climbers/0.jpg`,      // burpees
  EX013: `${BASE}/Mountain_Climbers/0.jpg`,      // jumping jacks
  EX025: `${BASE}/Mountain_Climbers/0.jpg`,      // bear crawl
  EX038: `${BASE}/Mountain_Climbers/0.jpg`,      // skater hops
  EX039: `${BASE}/Mountain_Climbers/0.jpg`,      // marche sur place
  EX043: `${BASE}/Mountain_Climbers/0.jpg`,      // sprint sur place
  EX047: `${BASE}/Mountain_Climbers/0.jpg`,      // sit-through

  // ── Mobilité / Récupération ───────────────────────────
  EX040: `${BASE}/Superman/0.jpg`,               // mobilité hanches
  EX041: `${BASE}/Superman/0.jpg`,               // étirement pectoraux
  EX042: `${BASE}/Superman/0.jpg`,               // child pose
  EX050: `${BASE}/Superman/0.jpg`,               // cohérence cardiaque

  // ── Corde à sauter (toutes les variantes) ─────────────
  EX056: `${BASE}/Mountain_Climbers/0.jpg`,
  EX057: `${BASE}/Mountain_Climbers/0.jpg`,
  EX058: `${BASE}/Mountain_Climbers/0.jpg`,
}

async function main() {
  console.log("🖼️  Updating exercise images...")

  let updated = 0
  let fallback = 0

  // Update exercises with explicit mapping
  for (const [slug, imageUrl] of Object.entries(SLUG_MAP)) {
    const result = await prisma.exercise.updateMany({
      where: { slug, imageUrl: null },
      data: { imageUrl },
    })
    if (result.count > 0) updated++
  }
  console.log(`✅ ${updated} exercises updated with specific images`)

  // Update remaining exercises with pattern-based fallback
  const remaining = await prisma.exercise.findMany({
    where: { imageUrl: null, pattern: { not: null } },
    select: { id: true, slug: true, pattern: true },
  })

  for (const ex of remaining) {
    const imageUrl = ex.pattern ? (PATTERN_FALLBACK[ex.pattern] ?? PATTERN_FALLBACK.Core) : null
    if (imageUrl) {
      await prisma.exercise.update({ where: { id: ex.id }, data: { imageUrl } })
      fallback++
    }
  }
  console.log(`✅ ${fallback} exercises updated with pattern fallback`)

  const total = await prisma.exercise.count({ where: { imageUrl: { not: null } } })
  console.log(`🎉 Total exercises with images: ${total}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
