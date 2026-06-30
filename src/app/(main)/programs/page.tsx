import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProgramsClient } from "./programs-client"

export default async function ProgramsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [programs, userProgram, profile] = await Promise.all([
    db.program.findMany({ orderBy: { createdAt: "asc" } }),
    db.userProgram.findFirst({ where: { userId: session.user.id, isActive: true }, include: { program: true } }),
    db.profile.findUnique({ where: { userId: session.user.id } }),
  ])

  return <ProgramsClient programs={programs} activeProgramId={userProgram?.programId} profile={profile} userId={session.user.id} />
}
