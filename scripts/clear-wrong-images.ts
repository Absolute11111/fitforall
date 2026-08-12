import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Only these 58 curated slugs have verified-correct images
const VERIFIED_SLUGS = [
  "EX001","EX002","EX003","EX004","EX005","EX006","EX007","EX008","EX009","EX010",
  "EX011","EX012","EX013","EX014","EX015","EX016","EX017","EX018","EX019","EX020",
  "EX021","EX022","EX023","EX024","EX025","EX026","EX027","EX028","EX029","EX030",
  "EX031","EX032","EX033","EX034","EX035","EX036","EX037","EX038","EX039","EX040",
  "EX041","EX042","EX043","EX044","EX045","EX046","EX047","EX048","EX049","EX050",
  "EX051","EX052","EX053","EX054","EX055","EX056","EX057","EX058",
]

async function main() {
  console.log("Clearing wrong pattern-fallback images...")
  const result = await prisma.exercise.updateMany({
    where: { slug: { notIn: VERIFIED_SLUGS }, imageUrl: { not: null } },
    data: { imageUrl: null },
  })
  console.log(`Cleared ${result.count} wrong images`)
  const remaining = await prisma.exercise.count({ where: { imageUrl: { not: null } } })
  console.log(`${remaining} exercises still have (verified) images`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
