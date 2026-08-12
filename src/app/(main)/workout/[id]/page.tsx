import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { WorkoutClient } from "./workout-client"
import { getDailyWorkout } from "@/lib/daily-workout"

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Fetch equipment first so getDailyWorkout can filter exercises
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { equipment: true },
  })

  const userEquipment = profile?.equipment ?? []
  const dailyWorkout = await getDailyWorkout(session.user.id, id, userEquipment)
  if (!dailyWorkout) redirect("/programs")

  return (
    <WorkoutClient
      session={dailyWorkout}
      userId={session.user.id}
      userEquipment={userEquipment}
      isVaried={dailyWorkout.isVaried}
    />
  )
}
