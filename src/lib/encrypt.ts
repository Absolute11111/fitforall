import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto"

const ALGO = "aes-256-gcm"

function key(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) throw new Error("ENCRYPTION_KEY env var missing")
  return createHash("sha256").update(raw).digest()
}

export function encrypt(text: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key(), iv)
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`
}

export function decrypt(data: string): string {
  const parts = data.split(".")
  if (parts.length !== 3) throw new Error("Bad encrypted format")
  const [ivB64, tagB64, encB64] = parts
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64url"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}

const ENC_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/

export function safeDecrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  if (!ENC_RE.test(value)) return value
  try { return decrypt(value) } catch { return value }
}

export function safeEncrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  if (ENC_RE.test(value)) return value // already encrypted
  return encrypt(value)
}
