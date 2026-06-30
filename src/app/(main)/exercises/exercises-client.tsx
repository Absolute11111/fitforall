"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LEVEL_LABELS } from "@/types"
import type { Exercise } from "@/generated/prisma"
import { Search, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = { exercises: Exercise[] }

const MUSCLES = ["Tous", "Pectoraux", "Dos", "Jambes", "Fessiers", "Épaules", "Abdos/gainage", "Cardio", "Mobilité"]
const LEVELS = ["Tous", "BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]
const EQUIPMENT = ["Tous", "Poids du corps", "Chaise", "Élastique", "Aucun"]

export function ExercisesClient({ exercises }: Props) {
  const [search, setSearch] = useState("")
  const [muscle, setMuscle] = useState("Tous")
  const [level, setLevel] = useState("Tous")
  const [equipment, setEquipment] = useState("Tous")
  const [selected, setSelected] = useState<Exercise | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      if (muscle !== "Tous" && ex.mainMuscle !== muscle) return false
      if (level !== "Tous" && ex.level !== level) return false
      if (equipment !== "Tous" && ex.equipment !== equipment) return false
      return true
    })
  }, [exercises, search, muscle, level, equipment])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">Bibliothèque d'exercices</h1>
        <p className="text-muted-foreground text-sm mt-1">{exercises.length} exercices · filtre par muscle, niveau, matériel</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un exercice..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MUSCLES.map((m) => (
            <button key={m} onClick={() => setMuscle(m)}
              className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                muscle === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
              )}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                level === l ? "bg-secondary text-foreground border-secondary" : "border-border text-muted-foreground"
              )}>
              {l === "Tous" ? "Tous niveaux" : LEVEL_LABELS[l as keyof typeof LEVEL_LABELS]}
            </button>
          ))}
          {EQUIPMENT.map((e) => (
            <button key={e} onClick={() => setEquipment(e)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                equipment === e ? "bg-secondary text-foreground border-secondary" : "border-border text-muted-foreground"
              )}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <Card key={ex.id} onClick={() => setSelected(ex)} className="p-4 bg-card border-border hover:border-primary/30 cursor-pointer transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm leading-tight">{ex.name}</h3>
              <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{ex.mainMuscle}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs">{LEVEL_LABELS[ex.level]}</Badge>
              <Badge variant="outline" className="text-xs">{ex.equipment}</Badge>
            </div>
            {ex.defaultSets && <p className="text-xs text-muted-foreground mt-2">{ex.defaultSets}</p>}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">Aucun exercice ne correspond à ces filtres.</p>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <Card className="max-w-md w-full p-6 bg-card border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge variant="outline" className="text-xs">{selected.mainMuscle}</Badge>
              <Badge variant="outline" className="text-xs">{LEVEL_LABELS[selected.level]}</Badge>
              <Badge variant="outline" className="text-xs">{selected.equipment}</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {selected.defaultSets && <p><span className="font-medium">Séries : </span>{selected.defaultSets} {selected.restSeconds ? `· repos ${selected.restSeconds}s` : ""}</p>}
              {selected.instructions && <p><span className="font-medium">Technique : </span>{selected.instructions}</p>}
              {selected.safety && <p className="text-muted-foreground"><span className="font-medium">Sécurité : </span>{selected.safety}</p>}
              {selected.secondaryMuscles.length > 0 && <p className="text-muted-foreground"><span className="font-medium">Muscles secondaires : </span>{selected.secondaryMuscles.join(", ")}</p>}
            </div>
            <div className="flex gap-3 mt-4 text-xs text-muted-foreground">
              <span>Intensité : {"●".repeat(selected.intensity)}{"○".repeat(5 - selected.intensity)}</span>
              <span>Impact : {"●".repeat(selected.impact)}{"○".repeat(5 - selected.impact)}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
