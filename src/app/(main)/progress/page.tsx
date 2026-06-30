import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProgressClient } from "./progress-client"

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [measurements, workoutLogs, profile] = await Promise.all([
    db.measurement.findMany({ where: { userId: session.user.id }, orderBy: { recordedAt: "asc" }, take: 90 }),
    db.workoutLog.findMany({ where: { userId: session.user.id }, orderBy: { completedAt: "desc" }, take: 20, include: { programSession: { include: { program: true } } } }),
    db.profile.findUnique({ where: { userId: session.user.id } }),
  ])

  return <ProgressClient measurements={measurements} workoutLogs={workoutLogs} profile={profile} />
}
