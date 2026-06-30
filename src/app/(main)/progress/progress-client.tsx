"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus, TrendingUp, CheckCircle, Zap, PartyPopper, Lock, ChevronRight } from "lucide-react"
import type { Measurement, WorkoutLog, ProgramSession, Program, Profile } from "@/generated/prisma"
import { getWeightMilestones, getSessionMilestones, getLatestMilestoneMessage } from "@/lib/milestones"
import { getRankProgress, RANKS } from "@/lib/ranks"
import { cn } from "@/lib/utils"

type Log = WorkoutLog & { programSession: (ProgramSession & { program: Program }) | null }

type Props = {
  measurements: Measurement[]
  workoutLogs: Log[]
  totalWorkouts: number
  profile: Profile | null
}

export function ProgressClient({ measurements, workoutLogs, totalWorkouts, profile }: Props) {
  const router = useRouter()
  const [weight, setWeight] = useState("")
  const [waist, setWaist] = useState("")
  const [energy, setEnergy] = useState("3")
  const [saving, setSaving] = useState(false)

  const chartData = measurements.map((m) => ({
    date: format(new Date(m.recordedAt), "dd/MM", { locale: fr }),
    poids: m.weightKg ? Number(m.weightKg) : null,
  }))

  async function saveMeasurement() {
    setSaving(true)
    await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: weight || undefined, waistCm: waist || undefined, energyLevel: parseInt(energy) }),
    })
    setSaving(false)
    setWeight("")
    setWaist("")
    router.refresh()
  }

  const lastMeasurement = measurements[measurements.length - 1]
  const targetWeight = profile?.targetWeightKg ? Number(profile.targetWeightKg) : null
  const currentWeight = lastMeasurement?.weightKg ? Number(lastMeasurement.weightKg) : (profile?.currentWeightKg ? Number(profile.currentWeightKg) : null)
  const startWeight = profile?.currentWeightKg ? Number(profile.currentWeightKg) : currentWeight
  const diff = currentWeight && targetWeight ? Math.abs(currentWeight - targetWeight) : null

  const totalGap = startWeight && targetWeight ? startWeight - targetWeight : 0
  const currentGap = currentWeight && targetWeight ? currentWeight - targetWeight : 0
  const weightProgressPct = totalGap !== 0
    ? Math.min(100, Math.max(0, Math.round(((totalGap - currentGap) / Math.abs(totalGap)) * 100)))
    : 100

  const goals = profile?.goals ?? ["HEALTH"]
  const weightMilestones = getWeightMilestones(goals, weightProgressPct)
  const sessionMilestones = getSessionMilestones(goals, totalWorkouts)
  const latestMessage = getLatestMilestoneMessage(goals, weightProgressPct, totalWorkouts)

  // Rank system
  const { current: rank, next: nextRank, sessionsInCurrentRank, sessionsNeededForNext, pct: rankPct } = getRankProgress(totalWorkouts)
  const currentRankIdx = RANKS.findIndex((r) => r.id === rank.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-wide">Progression</h1>
        <p className="text-muted-foreground text-sm mt-1">Ton niveau, tes mesures, ton histoire.</p>
      </div>

      {/* ══════════════════════════════════════════
          RANG ACTUEL — Section principale
      ══════════════════════════════════════════ */}
      <div
        className={cn("relative rounded-2xl border-2 overflow-hidden p-6 sm:p-8", rank.borderColor, rank.bgColor)}
        style={{ boxShadow: `0 0 40px ${rank.glowColor}` }}
      >
        {/* Background glow blob */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${rank.glowColor}, transparent 70%)` }}
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Rank badge */}
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">Rang actuel</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl">{rank.emoji}</span>
              <h2 className={cn("font-display text-5xl sm:text-7xl leading-none tracking-wide", rank.color)}>
                {rank.name}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{rank.subtitle}</p>
          </div>

          {/* Separator on desktop */}
          <div className="hidden sm:block h-24 w-px bg-border mx-2" />

          {/* Right side: quote + XP */}
          <div className="flex-1 space-y-4">
            <p className="text-sm leading-relaxed italic text-foreground/80">"{rank.quote}"</p>

            {/* XP bar */}
            {nextRank ? (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{totalWorkouts} séances</span>
                  <span className={cn("font-medium", nextRank.color)}>
                    {nextRank.minSessions} → {nextRank.name}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", rank.borderColor.replace("border-", "bg-"))}
                    style={{ width: `${rankPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {sessionsInCurrentRank} / {sessionsNeededForNext} séances pour <span className={nextRank.color}>{nextRank.name}</span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <p className="text-sm font-medium">Rang maximum atteint. Tu es une Légende.</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{rank.description}</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ÉCHELLE DES RANGS
      ══════════════════════════════════════════ */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-primary" />
          Tous les rangs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RANKS.map((r, idx) => {
            const reached = totalWorkouts >= r.minSessions
            const isCurrent = r.id === rank.id

            return (
              <div
                key={r.id}
                className={cn(
                  "relative rounded-xl border p-3 text-center transition-all",
                  isCurrent
                    ? cn("border-2", r.borderColor, r.bgColor)
                    : reached
                    ? "border-border bg-secondary/20 opacity-80"
                    : "border-border bg-transparent opacity-40"
                )}
                style={isCurrent ? { boxShadow: `0 0 20px ${r.glowColor}` } : undefined}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-display uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Actuel
                  </span>
                )}
                <div className="text-2xl mb-1">{r.emoji}</div>
                <p className={cn("font-display text-sm tracking-wide", isCurrent ? r.color : reached ? "text-foreground" : "text-muted-foreground")}>
                  {r.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {r.maxSessions ? `${r.minSessions}–${r.maxSessions} séances` : `${r.minSessions}+ séances`}
                </p>
                {reached && !isCurrent && (
                  <CheckCircle className="w-3.5 h-3.5 text-primary mx-auto mt-1" />
                )}
                {!reached && (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto mt-1" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS RAPIDES
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card border-border text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg sm:text-2xl font-bold">{totalWorkouts}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Séances</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-card border-border text-center">
          <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-lg sm:text-2xl font-bold">{currentWeight ?? "—"}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">kg actuel</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-card border-border text-center">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg sm:text-2xl font-bold">{diff ? `${diff.toFixed(1)} kg` : "—"}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">restants</p>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          MESSAGE D'ENCOURAGEMENT
      ══════════════════════════════════════════ */}
      {latestMessage && (
        <Card className="p-5 bg-primary/5 border-primary/20 flex items-start gap-3">
          <PartyPopper className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">{latestMessage}</p>
        </Card>
      )}

      {/* ══════════════════════════════════════════
          PALIERS OBJECTIF POIDS
      ══════════════════════════════════════════ */}
      <Card className="p-5 bg-card border-border space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Objectif de poids</h3>
            <span className="text-xs text-primary font-bold">{weightProgressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${weightProgressPct}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {weightMilestones.map((m) => (
              <div key={m.threshold} className={cn("rounded-xl border p-2 sm:p-3 text-center transition-colors",
                m.reached ? "border-primary bg-primary/5" : "border-border opacity-40"
              )}>
                {m.reached ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mx-auto mb-1" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mx-auto mb-1" />}
                <p className="text-[10px] sm:text-xs font-semibold">{m.threshold}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Paliers de séances</h3>
            <span className="text-xs text-muted-foreground">{totalWorkouts} au total</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {sessionMilestones.map((m) => (
              <div key={m.threshold} className={cn("rounded-xl border p-2 sm:p-3 text-center transition-colors",
                m.reached ? "border-accent bg-accent/5" : "border-border opacity-40"
              )}>
                {m.reached ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mx-auto mb-1" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground mx-auto mb-1" />}
                <p className="text-[10px] sm:text-xs font-semibold">{m.threshold}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          ENREGISTRER UNE MESURE
      ══════════════════════════════════════════ */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Enregistrer une mesure</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Poids (kg)</Label>
            <Input type="number" step="0.1" placeholder="72.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tour taille (cm)</Label>
            <Input type="number" placeholder="82" value={waist} onChange={(e) => setWaist(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Énergie (1-5)</Label>
            <Input type="number" min={1} max={5} value={energy} onChange={(e) => setEnergy(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled={saving || (!weight && !waist)} onClick={saveMeasurement}>
              {saving ? "..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          GRAPHIQUE POIDS
      ══════════════════════════════════════════ */}
      {chartData.length > 1 && (
        <Card className="p-5 bg-card border-border">
          <h3 className="font-semibold text-sm mb-4">Évolution du poids</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip
                contentStyle={{ background: "#1a1a17", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="poids" stroke="oklch(0.91 0.21 124)" strokeWidth={2.5} dot={{ r: 3, fill: "oklch(0.91 0.21 124)" }} name="Poids (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ══════════════════════════════════════════
          HISTORIQUE SÉANCES
      ══════════════════════════════════════════ */}
      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold text-sm mb-4">Dernières séances</h3>
        {workoutLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune séance enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{log.programSession?.sessionName ?? "Séance libre"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.completedAt), "dd MMM yyyy", { locale: fr })}
                    {log.durationMin && ` · ${log.durationMin} min`}
                  </p>
                </div>
                {log.rpe && <Badge variant="outline" className="text-xs shrink-0">RPE {log.rpe}/10</Badge>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
