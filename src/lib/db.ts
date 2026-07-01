import { PrismaClient } from "@/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { safeEncrypt, safeDecrypt } from "@/lib/encrypt"

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> | undefined }

const base = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = base

// Encrypted PII fields per model
const ENC_WRITE: Record<string, string[]> = {
  user: ["name"],
  profile: ["injuries", "gender"],
}

function encryptData(model: string, data: Record<string, unknown> | null | undefined) {
  if (!data) return
  const fields = ENC_WRITE[model] ?? []
  for (const f of fields) {
    if (typeof data[f] === "string") data[f] = safeEncrypt(data[f] as string)
  }
}

function decryptRow(model: string, row: Record<string, unknown> | null | undefined) {
  if (!row || typeof row !== "object") return
  const fields = ENC_WRITE[model] ?? []
  for (const f of fields) {
    if (typeof row[f] === "string") row[f] = safeDecrypt(row[f] as string)
  }
}

function decryptResult(model: string, result: unknown) {
  if (!result) return
  if (Array.isArray(result)) result.forEach((r) => decryptRow(model, r))
  else decryptRow(model, result as Record<string, unknown>)
}

export const db = base.$extends({
  query: {
    user: {
      async $allOperations({ operation, args, query }) {
        const writeOps = ["create", "update", "upsert", "createMany", "updateMany"]
        if (writeOps.includes(operation)) {
          const a = args as Record<string, unknown>
          encryptData("user", a.data as Record<string, unknown>)
        }
        const result = await query(args)
        decryptResult("user", result)
        return result
      },
    },
    profile: {
      async $allOperations({ operation, args, query }) {
        const writeOps = ["create", "update", "upsert", "createMany", "updateMany"]
        if (writeOps.includes(operation)) {
          const a = args as Record<string, unknown>
          encryptData("profile", a.data as Record<string, unknown>)
        }
        const result = await query(args)
        decryptResult("profile", result)
        return result
      },
    },
  },
})

export type Db = typeof db
