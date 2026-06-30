"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GOAL_LABELS, LEVEL_LABELS, formatGoals } from "@/types"
import type { Program, Profile } from "@/generated/prisma"
import { CheckCircle, Clock, Calendar, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"
import { scoreProgramForGoals } from "@/lib/nutrition"

const GOAL_EMOJI: Record<string, string> = {
  FAT_LOSS: "🔥", MUSCLE_GAIN: "💪", RECOMPOSITION: "⚖️", HEALTH: "❤️", ENDURANCE: "🏃"
}

type Props = {
  programs: Program[]
  activeProgramId?: string
  profile: Profile | null
  userId: string
}

export function ProgramsClient({ programs, activeProgramId, profile }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function activate(programId: string) {
    setLoading(true)
    await fetch("/api/programs/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId }),
    })
    setLoading(false)
    router.refresh()
  }

  const recommended = profile
    ? programs
        .map((p) => ({ program: p, score: scoreProgramForGoals(p.goal, profile.goals) + (p.level === profile.level || p.level === "ALL" ? 0.5 : 0) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)[0]?.program ?? null
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">Programmes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {programs.length} programmes disponibles · Le programme recommandé est mis en avant selon ton profil
        </p>
      </div>

      {recommended && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-primary">Recommandé pour toi : </span>
            <span className="text-foreground">{recommended.name}</span>
            <span className="text-muted-foreground"> — basé sur tes objectifs ({formatGoals(profile!.goals)}) et ton niveau ({LEVEL_LABELS[profile!.level]})</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => {
          const isActive = p.id === activeProgramId
          const isRecommended = p.id === recommended?.id

          return (
            <Card
              key={p.id}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
              className={cn(
                "p-5 cursor-pointer border transition-all",
                isActive ? "border-accent bg-accent/5" :
                isRecommended ? "border-primary bg-primary/5" :
                "border-border hover:border-primary/40 bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{GOAL_EMOJI[p.goal] ?? "🏋️"}</span>
                  <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                </div>
                {isActive && <Badge className="bg-accent/20 text-accent border-0 text-xs shrink-0">Actif</Badge>}
                {isRecommended && !isActive && <Badge className="bg-primary/20 text-primary border-0 text-xs shrink-0">Recommandé</Badge>}
              </div>

              <div className="flex gap-2 flex-wrap mb-3">
                <Badge variant="outline" className="text-xs">{LEVEL_LABELS[p.level]}</Badge>
                <Badge variant="outline" className="text-xs">{GOAL_LABELS[p.goal]}</Badge>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.sessionDuration} min</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.sessionsPerWeek}x/sem</span>
              </div>

              {p.structure && <p className="text-xs text-muted-foreground mb-1">{p.structure}</p>}
              {p.nutritionNote && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 shrink-0" />{p.nutritionNote}
                </p>
              )}

              {selected === p.id && !isActive && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button className="w-full" size="sm" disabled={loading} onClick={(e) => { e.stopPropagation(); activate(p.id) }}>
                    {loading ? "Activation..." : "Choisir ce programme"}
                  </Button>
                  {p.progression && <p className="text-xs text-muted-foreground mt-2 text-center">{p.progression}</p>}
                </div>
              )}
              {isActive && (
                <div className="mt-3 text-xs text-accent font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Programme en cours
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
