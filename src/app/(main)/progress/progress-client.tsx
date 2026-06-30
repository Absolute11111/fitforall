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
import { Plus, TrendingUp, CheckCircle, Zap, PartyPopper, Lock } from "lucide-react"
import type { Measurement, WorkoutLog, ProgramSession, Program, Profile } from "@/generated/prisma"
import { getWeightMilestones, getSessionMilestones, getLatestMilestoneMessage } from "@/lib/milestones"
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
    tour: m.waistCm ? Number(m.waistCm) : null,
    energie: m.energyLevel,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">Progression</h1>
        <p className="text-muted-foreground text-sm mt-1">Suis ton évolution sur le long terme.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">Séances</p>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-xl font-bold">{currentWeight ?? "—"}</p>
          <p className="text-xs text-muted-foreground">kg actuel</p>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{diff ? `${diff.toFixed(1)} kg` : "—"}</p>
          <p className="text-xs text-muted-foreground">restants</p>
        </Card>
      </div>

      {/* Encouragement banner */}
      {latestMessage && (
        <Card className="p-5 bg-primary/5 border-primary/20 flex items-start gap-3">
          <PartyPopper className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">{latestMessage}</p>
        </Card>
      )}

      {/* Milestones */}
      <Card className="p-5 bg-card border-border space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Paliers vers ton objectif de poids</h3>
            <span className="text-xs text-muted-foreground">{weightProgressPct}%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {weightMilestones.map((m) => (
              <div key={m.threshold} className={cn("rounded-xl border p-3 text-center transition-colors",
                m.reached ? "border-primary bg-primary/5" : "border-border opacity-50"
              )}>
                {m.reached ? <CheckCircle className="w-4 h-4 text-primary mx-auto mb-1" /> : <Lock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />}
                <p className="text-xs font-semibold">{m.threshold}%</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Paliers de séances</h3>
            <span className="text-xs text-muted-foreground">{totalWorkouts} au total</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {sessionMilestones.map((m) => (
              <div key={m.threshold} className={cn("rounded-xl border p-3 text-center transition-colors",
                m.reached ? "border-accent bg-accent/5" : "border-border opacity-50"
              )}>
                {m.reached ? <CheckCircle className="w-4 h-4 text-accent mx-auto mb-1" /> : <Lock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />}
                <p className="text-xs font-semibold">{m.threshold}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Add measurement */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Ajouter une mesure</h3>
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

      {/* Weight chart */}
      {chartData.length > 1 && (
        <Card className="p-5 bg-card border-border">
          <h3 className="font-semibold text-sm mb-4">Évolution du poids</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="poids" stroke="oklch(0.72 0.19 45)" strokeWidth={2} dot={false} name="Poids (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Workout history */}
      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold text-sm mb-4">Historique des séances</h3>
        {workoutLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune séance enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {workoutLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{log.programSession?.sessionName ?? "Séance libre"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.completedAt), "dd MMM yyyy", { locale: fr })}
                    {log.durationMin && ` · ${log.durationMin} min`}
                  </p>
                </div>
                {log.rpe && <Badge variant="outline" className="text-xs">RPE {log.rpe}/10</Badge>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
