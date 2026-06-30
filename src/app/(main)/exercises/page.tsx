import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ExercisesClient } from "./exercises-client"

export default async function ExercisesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const exercises = await db.exercise.findMany({ orderBy: [{ level: "asc" }, { name: "asc" }] })
  return <ExercisesClient exercises={exercises} />
}
