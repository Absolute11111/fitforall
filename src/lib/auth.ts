import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,    // 30 jours
    updateAge: 24 * 60 * 60,       // renouvelle le JWT une fois par jour
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.password) return null

        const bcrypt = await import("bcryptjs")
        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
        if (!passwordMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Fresh login — set id and role from the auth provider
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "user"
      }
      // Always re-fetch name + role from DB so the JWT reflects current plaintext values
      if (token.id) {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, role: true },
        })
        if (fresh) {
          token.name = fresh.name
          token.role = fresh.role ?? "user"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? "user"
      }
      return session
    },
  },
})
