import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { WorkoutClient } from "./workout-client"

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const programSession = await db.programSession.findUnique({
    where: { id },
    include: {
      program: true,
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  })

  if (!programSession) redirect("/programs")

  return <WorkoutClient session={programSession} userId={session.user.id} />
}
