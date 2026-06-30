import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { EquipmentPanel } from "@/components/equipment-panel"

export default async function EquipmentPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { equipment: true },
  })

  if (!profile) redirect("/onboarding")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-wide">Mon équipement</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sélectionne ce que tu as à disposition — les séances et suggestions d'exercices s'adaptent.
        </p>
      </div>

      <EquipmentPanel current={profile.equipment} />
    </div>
  )
}
