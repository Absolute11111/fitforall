import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Flame, TrendingUp, Dumbbell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
  return `Il y a ${Math.floor(seconds / 86400)} jour${Math.floor(seconds / 86400) > 1 ? "s" : ""}`
}

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
}

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const logs = await db.workoutLog.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: "desc" },
    take: 50,
    include: {
      programSession: {
        select: {
          sessionName: true,
          program: { select: { name: true } },
        },
      },
    },
  })

  const totalMinutes = logs.reduce((s, l) => s + (l.durationMin ?? 0), 0)
  const avgRpe = logs.filter(l => l.rpe).reduce((s, l, _, a) => s + (l.rpe ?? 0) / a.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-wide">Historique</h1>
        <p className="text-muted-foreground text-sm mt-1">{logs.length} séances enregistrées</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Dumbbell, label: "Séances", value: logs.length, color: "text-primary" },
          { icon: Clock, label: "Temps total", value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, color: "text-blue-400" },
          { icon: Flame, label: "RPE moyen", value: avgRpe ? avgRpe.toFixed(1) : "—", color: "text-accent" },
          { icon: TrendingUp, label: "Moy./semaine", value: (logs.length / Math.max(1, Math.ceil((Date.now() - (logs[logs.length - 1]?.completedAt?.getTime() ?? Date.now())) / (7 * 86400000)))).toFixed(1), color: "text-green-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="p-4 bg-card border-border">
            <Icon className={`w-4 h-4 mb-2 ${color}`} />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      {/* Logs list */}
      <div className="space-y-3">
        {logs.length === 0 && (
          <div className="text-center py-16">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Aucune séance enregistrée pour l'instant.</p>
            <Link href="/programs"><Button className="mt-4">Commencer un programme</Button></Link>
          </div>
        )}
        {logs.map((log) => (
          <Card key={log.id} className="p-4 bg-card border-border hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">
                    {log.programSession
                      ? `${log.programSession.sessionName} · ${log.programSession.program.name}`
                      : "Séance libre"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(log.completedAt)} · {timeAgo(log.completedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {log.durationMin && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />{log.durationMin}min
                  </Badge>
                )}
                {log.rpe && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Flame className="w-3 h-3 text-accent" />RPE {log.rpe}
                  </Badge>
                )}
              </div>
            </div>
            {log.notes && <p className="text-xs text-muted-foreground mt-2 pl-12">{log.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
