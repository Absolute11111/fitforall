import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { WorkoutClient } from "./workout-client"
import { getDailyWorkout } from "@/lib/daily-workout"

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const dailyWorkout = await getDailyWorkout(session.user.id, id)
  if (!dailyWorkout) redirect("/programs")

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { equipment: true },
  })

  return (
    <WorkoutClient
      session={dailyWorkout}
      userId={session.user.id}
      userEquipment={profile?.equipment ?? []}
      isVaried={dailyWorkout.isVaried}
    />
  )
}
