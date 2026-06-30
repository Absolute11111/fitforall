import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LEVEL_LABELS, GOAL_LABELS, formatGoals } from "@/types"
import { Users, Dumbbell, ListChecks, Activity } from "lucide-react"

const ADMIN_EMAILS = ["admin@fitforall.com"]

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  if (!ADMIN_EMAILS.includes(session.user.email)) redirect("/dashboard")

  const [userCount, exerciseCount, programCount, workoutLogCount, recentUsers] = await Promise.all([
    db.user.count(),
    db.exercise.count(),
    db.program.count(),
    db.workoutLog.count(),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { profile: true } }),
  ])

  const exercisesByLevel = await db.exercise.groupBy({ by: ["level"], _count: true })
  const programsByGoal = await db.program.groupBy({ by: ["goal"], _count: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">Administration</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble du contenu et des utilisateurs FitForAll.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Utilisateurs", value: userCount },
          { icon: Dumbbell, label: "Exercices", value: exerciseCount },
          { icon: ListChecks, label: "Programmes", value: programCount },
          { icon: Activity, label: "Séances loguées", value: workoutLogCount },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4 bg-card border-border">
            <Icon className="w-4 h-4 text-primary mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border">
          <h3 className="font-semibold text-sm mb-4">Exercices par niveau</h3>
          <div className="space-y-2">
            {exercisesByLevel.map((g) => (
              <div key={g.level} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{LEVEL_LABELS[g.level]}</span>
                <Badge variant="outline">{g._count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <h3 className="font-semibold text-sm mb-4">Programmes par objectif</h3>
          <div className="space-y-2">
            {programsByGoal.map((g) => (
              <div key={g.goal} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{GOAL_LABELS[g.goal]}</span>
                <Badge variant="outline">{g._count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold text-sm mb-4">Derniers utilisateurs inscrits</h3>
        <div className="space-y-3">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
              <div>
                <p className="font-medium">{u.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex gap-2">
                {u.profile && <Badge variant="outline" className="text-xs">{formatGoals(u.profile.goals)}</Badge>}
                {!u.profile && <Badge variant="outline" className="text-xs text-muted-foreground">Onboarding incomplet</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Gestion CRUD complète des exercices/programmes : utilise Prisma Studio (`npm run db:studio`) pour le MVP.
      </p>
    </div>
  )
}
