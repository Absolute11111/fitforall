import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [profile, supprefs] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.supplementPreferences.findUnique({ where: { userId: session.user.id } }),
  ])

  if (!profile) redirect("/onboarding")

  return <SettingsClient profile={profile} supprefs={supprefs} user={session.user} />
}
