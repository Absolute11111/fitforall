import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { readFileSync } from "fs"
import { join } from "path"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL"

const TSV_PATH = join(
  process.env.TSV_PATH ??
    "C:\\Users\\Ibibi\\AppData\\Local\\Temp\\claude\\c--Users-Ibibi-Desktop-Tout-Webapp-sport\\6920cdfc-7e6c-433a-bcb6-42f3e68e2bc0\\scratchpad\\exercises_15000.tsv"
)

function parseTsv(filePath: string) {
  const content = readFileSync(filePath, "utf-8").replace(/\r/g, "")
  const lines = content.split("\n").filter((l) => l.trim())
  const headers = lines[0].split("\t").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const vals = line.split("\t")
    const row: Record<string, string> = {}
    headers.forEach((h, i) => (row[h] = (vals[i] ?? "").trim()))
    return row
  })
}

async function main() {
  console.log("🌱 Seeding 15 000 exercises from TSV...")
  const rows = parseTsv(TSV_PATH)
  console.log(`📄 ${rows.length} rows parsed`)

  const BATCH = 500
  let total = 0
  let batches = 0
  const validLevels: Level[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const data = batch
      .filter((r) => r.slug && r.name)
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        mainMuscle: r.mainMuscle || "Général",
        secondaryMuscles: r.secondaryMuscles
          ? r.secondaryMuscles.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        level: (validLevels.includes(r.level as Level) ? r.level : "BEGINNER") as Level,
        equipment: r.equipment || "Aucun",
        exerciseType: r.exerciseType || "Renforcement",
        defaultSets: r.defaultSets || null,
        restSeconds: parseInt(r.restSeconds) || 60,
        instructions: r.instructions || null,
        safety: r.safety || null,
        intensity: Math.max(1, Math.min(5, parseInt(r.intensity) || 3)),
        impact: Math.max(1, Math.min(5, parseInt(r.impact) || 2)),
        family: r.family || null,
        objective: r.objective || null,
        bodyweightOnly: r.bodyweightOnly === "true",
        easyVariant: r.easyVariant || null,
        hardVariant: r.hardVariant || null,
        pattern: r.family || null,
      }))

    await prisma.exercise.createMany({ data, skipDuplicates: true })
    total += data.length
    batches++
    if (batches % 5 === 0) {
      process.stdout.write(`  ${total}/${rows.length} exercices insérés...\r`)
    }
  }

  const count = await prisma.exercise.count()
  console.log(`\n✅ ${total} exercices traités en ${batches} batches`)
  console.log(`📊 Total en base : ${count} exercices`)
  console.log("🎉 Seed mega terminé !")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
