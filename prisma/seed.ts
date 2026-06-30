import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { EXERCISES_SEED } from "../src/data/exercises"
import { PROGRAMS_SEED } from "../src/data/programs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  for (const ex of EXERCISES_SEED) {
    const { slug, name, mainMuscle, secondaryMuscles, level, equipment, exerciseType, equipmentNeeded, defaultSets, restSeconds, instructions, safety, intensity, impact, pattern, sourceUrl } = ex
    await prisma.exercise.upsert({
      where: { slug },
      update: { name, mainMuscle, secondaryMuscles, level: level as any, equipment, exerciseType, equipmentNeeded, defaultSets, restSeconds, instructions, safety, intensity, impact, pattern, sourceUrl },
      create: { slug, name, mainMuscle, secondaryMuscles, level: level as any, equipment, exerciseType, equipmentNeeded, defaultSets, restSeconds, instructions, safety, intensity, impact, pattern, sourceUrl },
    })
  }
  console.log(`✅ ${EXERCISES_SEED.length} exercises seeded`)

  for (const prog of PROGRAMS_SEED) {
    const { sessions, slug, name, level, goal, sessionDuration, sessionsPerWeek, structure, progression, nutritionNote } = prog

    const program = await prisma.program.upsert({
      where: { slug },
      update: { name, level: level as any, goal: goal as any, sessionDuration, sessionsPerWeek, structure, progression, nutritionNote },
      create: { slug, name, level: level as any, goal: goal as any, sessionDuration, sessionsPerWeek, structure, progression, nutritionNote },
    })

    await prisma.programSession.deleteMany({ where: { programId: program.id } })

    for (const sess of sessions) {
      const { exerciseSlugs, sessionName, order } = sess
      const programSession = await prisma.programSession.create({
        data: { sessionName, order, programId: program.id },
      })

      for (let i = 0; i < exerciseSlugs.length; i++) {
        const exercise = await prisma.exercise.findUnique({ where: { slug: exerciseSlugs[i] } })
        if (!exercise) { console.warn(`Exercise ${exerciseSlugs[i]} not found`); continue }
        await prisma.programExercise.create({
          data: { programSessionId: programSession.id, exerciseId: exercise.id, order: i },
        })
      }
    }
  }
  console.log(`✅ ${PROGRAMS_SEED.length} programs seeded`)
  console.log("🎉 Seed complete!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
