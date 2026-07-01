"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LEVEL_LABELS, GOAL_LABELS, formatGoals } from "@/types"
import {
  Users, Dumbbell, ListChecks, Activity, RefreshCw,
  Clock, Flame, TrendingUp, Shield, Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type AdminData = {
  stats: {
    userCount: number
    exerciseCount: number
    programCount: number
    workoutLogCount: number
    activeThisWeek: number
    newUsersThisWeek: number
  }
  users: Array<{
    id: string
    name: string | null
    email: string | null
    role: string
    createdAt: string
    profile: { goals: string[]; level: string; sessionsPerWeek: number } | null
    _count: { workoutLogs: number }
    workoutLogs: Array<{ completedAt: string; durationMin: number | null; rpe: number | null }>
  }>
  recentActivity: Array<{
    id: string
    completedAt: string
    durationMin: number | null
    rpe: number | null
    user: { name: string | null; email: string | null }
    programSession: { sessionName: string; program: { name: string } } | null
  }>
  exercisesByLevel: Array<{ level: string; _count: number }>
  programsByGoal: Array<{ goal: string; _count: number }>
  fetchedAt: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })
}

export function AdminClient() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "activity">("overview")

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastRefresh(new Date())
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetch_(false)
    const interval = setInterval(() => fetch_(true), 30_000)
    return () => clearInterval(interval)
  }, [fetch_])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  if (!data) return <p className="text-muted-foreground">Erreur de chargement.</p>

  const { stats, users, recentActivity, exercisesByLevel, programsByGoal } = data

  const tabs = [
    { key: "overview", label: "Vue d'ensemble" },
    { key: "users", label: `Utilisateurs (${stats.userCount})` },
    { key: "activity", label: "Activité récente" },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-primary" />
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide">Admin</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Tableau de bord FitForAll — mise à jour automatique toutes les 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
              Mis à jour {timeAgo(lastRefresh.toISOString())}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={() => fetch_(false)} disabled={refreshing} className="gap-1.5">
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Users, label: "Utilisateurs", value: stats.userCount, sub: `+${stats.newUsersThisWeek} cette semaine`, color: "text-primary" },
          { icon: Flame, label: "Actifs (7j)", value: stats.activeThisWeek, sub: `${stats.userCount ? Math.round(stats.activeThisWeek / stats.userCount * 100) : 0}% du total`, color: "text-accent" },
          { icon: Activity, label: "Séances", value: stats.workoutLogCount, sub: "total loguées", color: "text-blue-400" },
          { icon: Dumbbell, label: "Exercices", value: stats.exerciseCount.toLocaleString("fr"), sub: "en base", color: "text-purple-400" },
          { icon: ListChecks, label: "Programmes", value: stats.programCount, sub: "disponibles", color: "text-yellow-400" },
          { icon: TrendingUp, label: "Moy. séances/user", value: stats.userCount ? (stats.workoutLogCount / stats.userCount).toFixed(1) : "0", sub: "toutes périodes", color: "text-green-400" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <Card key={label} className="p-4 bg-card border-border">
            <Icon className={cn("w-4 h-4 mb-2", color)} />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs font-medium text-foreground/80">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" /> Exercices par niveau
            </h3>
            <div className="space-y-3">
              {exercisesByLevel.map((g) => {
                const pct = Math.round(g._count / stats.exerciseCount * 100)
                return (
                  <div key={g.level}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{LEVEL_LABELS[g.level as keyof typeof LEVEL_LABELS] ?? g.level}</span>
                      <span className="font-medium">{g._count.toLocaleString("fr")} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-accent" /> Programmes par objectif
            </h3>
            <div className="space-y-2">
              {programsByGoal.map((g) => (
                <div key={g.goal} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{GOAL_LABELS[g.goal as keyof typeof GOAL_LABELS] ?? g.goal}</span>
                  <Badge variant="outline">{g._count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-card border-border md:col-span-2">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Dernières inscriptions
            </h3>
            <div className="space-y-2">
              {users.slice(0, 8).map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0 flex-wrap sm:flex-nowrap">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name ?? <span className="text-muted-foreground italic">Sans nom</span>}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {u.role === "admin" && <Badge className="text-xs bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
                    {u.profile
                      ? <Badge variant="outline" className="text-xs">{formatGoals(u.profile.goals as any)}</Badge>
                      : <Badge variant="outline" className="text-xs text-muted-foreground">Onboarding</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Profil</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Séances</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Dernière activité</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Inscription</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={cn("border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors", i % 2 === 0 ? "" : "bg-secondary/5")}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-32">{u.name ?? <span className="text-muted-foreground italic text-xs">—</span>}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-32 md:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-muted-foreground text-xs font-mono">{u.email}</span>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {u.profile ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="outline" className="text-xs w-fit">{LEVEL_LABELS[u.profile.level as keyof typeof LEVEL_LABELS] ?? u.profile.level}</Badge>
                          <span className="text-xs text-muted-foreground">{formatGoals(u.profile.goals as any)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Incomplet</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn("font-bold", u._count.workoutLogs > 0 ? "text-primary" : "text-muted-foreground")}>
                        {u._count.workoutLogs}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {u.workoutLogs[0] ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(u.workoutLogs[0].completedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                    </td>
                    <td className="p-3 text-center">
                      {u.role === "admin" ? (
                        <Badge className="text-xs bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">User</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Activity tab */}
      {activeTab === "activity" && (
        <Card className="p-5 bg-card border-border">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> 25 dernières séances loguées
          </h3>
          <div className="space-y-0 divide-y divide-border/50">
            {recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {log.programSession
                        ? `${log.programSession.sessionName} · ${log.programSession.program.name}`
                        : "Séance libre"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{log.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  {log.durationMin && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.durationMin}min
                    </span>
                  )}
                  {log.rpe && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-accent" /> RPE {log.rpe}
                    </span>
                  )}
                  <span>{timeAgo(log.completedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
