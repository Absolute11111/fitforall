"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GOAL_LABELS, LEVEL_LABELS } from "@/types"
import type { Profile, SupplementPreferences } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { CheckCircle, Save } from "lucide-react"

type Props = {
  profile: Profile
  supprefs: SupplementPreferences | null
  user: { name?: string | null; email?: string | null }
}

const GOALS = ["FAT_LOSS", "MUSCLE_GAIN", "RECOMPOSITION", "HEALTH", "ENDURANCE"] as const
const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const

export function SettingsClient({ profile, supprefs, user }: Props) {
  const router = useRouter()
  const [goals, setGoals] = useState<string[]>(profile.goals)
  const [gender, setGender] = useState<string | undefined>(profile.gender ?? undefined)
  const [level, setLevel] = useState(profile.level)
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg?.toString() ?? "")
  const [sessionDuration, setSessionDuration] = useState(profile.sessionDuration)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(profile.sessionsPerWeek)
  const [useWhey, setUseWhey] = useState(supprefs?.useWhey ?? false)
  const [useCreatine, setUseCreatine] = useState(supprefs?.useCreatine ?? false)
  const [injuries, setInjuries] = useState(profile.injuries ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleGoal(g: string) {
    setGoals((prev) => {
      const next = prev.includes(g) ? prev.filter((v) => v !== g) : [...prev, g]
      return next.length ? next : prev
    })
  }

  async function save() {
    setSaving(true)
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals, gender, level, targetWeightKg: targetWeightKg || undefined, sessionDuration, sessionsPerWeek, useWhey, useCreatine, injuries }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  const hasFatLoss = goals.includes("FAT_LOSS")
  const hasMuscleGain = goals.includes("MUSCLE_GAIN")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-wide">Réglages</h1>
        <p className="text-muted-foreground text-sm mt-1">Modifie ton profil, ton objectif et tes préférences.</p>
      </div>

      <Card className="p-5 bg-card border-border space-y-4">
        <h3 className="font-semibold text-sm">Compte</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Prénom</Label>
            <Input value={user.name ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input value={user.email ?? ""} disabled />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-card border-border space-y-4">
        <h3 className="font-semibold text-sm">Objectifs & niveau</h3>
        <div>
          <Label className="text-xs mb-2 block">Objectifs (un ou plusieurs)</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button key={g} type="button" onClick={() => toggleGoal(g)}
                className={cn("p-2.5 rounded-lg border text-xs font-medium transition-colors text-left",
                  goals.includes(g) ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
          {hasFatLoss && hasMuscleGain && (
            <p className="text-xs text-primary mt-2">⚖️ Combo recomposition détecté — programme adapté en conséquence.</p>
          )}
        </div>
        <div>
          <Label className="text-xs mb-2 block">Sexe (optionnel)</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "female", label: "Femme" },
              { value: "male", label: "Homme" },
              { value: "other", label: "Autre" },
            ].map((g) => (
              <button key={g.value} type="button" onClick={() => setGender(gender === g.value ? undefined : g.value)}
                className={cn("p-2 rounded-lg border text-xs font-medium transition-colors",
                  gender === g.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs mb-2 block">Niveau</Label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={cn("flex-1 p-2 rounded-lg border text-xs font-medium transition-colors",
                  level === l ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Poids cible (kg)</Label>
          <Input type="number" step="0.1" value={targetWeightKg} onChange={(e) => setTargetWeightKg(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Blessures / douleurs</Label>
          <Input value={injuries} onChange={(e) => setInjuries(e.target.value)} placeholder="Aucune" />
        </div>
      </Card>

      <Card className="p-5 bg-card border-border space-y-4">
        <h3 className="font-semibold text-sm">Disponibilité</h3>
        <div>
          <Label className="text-xs mb-2 block">Durée par séance</Label>
          <div className="flex gap-2 flex-wrap">
            {[15, 25, 35, 45, 60].map((d) => (
              <button key={d} onClick={() => setSessionDuration(d)}
                className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                  sessionDuration === d ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {d} min
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs mb-2 block">Séances / semaine</Label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((s) => (
              <button key={s} onClick={() => setSessionsPerWeek(s)}
                className={cn("w-9 h-9 rounded-lg border text-xs font-medium transition-colors",
                  sessionsPerWeek === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-card border-border space-y-3">
        <h3 className="font-semibold text-sm">Compléments alimentaires</h3>
        <p className="text-xs text-muted-foreground">Toujours optionnels. Le programme fonctionne sans.</p>
        {[
          { label: "Whey protéinée", val: useWhey, set: setUseWhey },
          { label: "Créatine monohydrate", val: useCreatine, set: setUseCreatine },
        ].map(({ label, val, set }) => (
          <button key={label} onClick={() => set(!val)}
            className={cn("w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
              val ? "border-primary bg-primary/5" : "border-border"
            )}>
            <span className="text-sm font-medium">{label}</span>
            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", val ? "bg-primary border-primary" : "border-muted-foreground")}>
              {val && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
            </div>
          </button>
        ))}
      </Card>

      <Button onClick={save} disabled={saving} className="w-full h-11 gap-2">
        <Save className="w-4 h-4" />
        {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer les modifications"}
      </Button>
    </div>
  )
}
